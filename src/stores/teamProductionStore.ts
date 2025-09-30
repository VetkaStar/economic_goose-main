import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useAuthStore } from './authStore'

export type TeamRole = 'designer' | 'cutter' | 'sewer' | 'quality'

export interface TeamPlayer {
  id: string
  name: string
  role: TeamRole | null
  isReady: boolean
  contributed: number
}

export interface TeamRoomState {
  id: string
  status: 'lobby' | 'active' | 'finished'
  targetItems: number
  producedItems: number
  startedAt: string | null
  finishedAt: string | null
}

export const useTeamProductionStore = defineStore('teamProduction', () => {
  const authStore = useAuthStore()

  const room = ref<TeamRoomState | null>(null)
  const players = ref<TeamPlayer[]>([])
  const channel = ref<RealtimeChannel | null>(null)
  const isConnecting = ref(false)
  const error = ref<string | null>(null)

  const you = computed(() => players.value.find(p => p.id === authStore.user?.id) || null)
  const isReadyToStart = computed(() => {
    if (!room.value) return false
    if (room.value.status !== 'lobby') return false
    const hasMinPlayers = players.value.length >= 2
    const everyoneReady = players.value.every(p => p.isReady && p.role)
    return hasMinPlayers && everyoneReady
  })
  const progressPercent = computed(() => {
    if (!room.value) return 0
    if (room.value.targetItems <= 0) return 0
    return Math.min(100, Math.floor((room.value.producedItems / room.value.targetItems) * 100))
  })

  async function createOrJoinRoom(): Promise<boolean> {
    if (!authStore.user) {
      error.value = 'Необходима авторизация'
      return false
    }

    isConnecting.value = true
    error.value = null

    try {
      // Упрощённая модель: один общий канал комнаты на проект
      const roomId = 'default_room'

      await joinChannel(roomId)

      // Presence: объявляемся в канале
      await channel.value?.track({
        id: authStore.user.id,
        name: authStore.user.email || 'Игрок',
      })

      // Если состояние не инициализировано, инициируем локально и рассылаем
      if (!room.value) {
        room.value = {
          id: roomId,
          status: 'lobby',
          targetItems: 20,
          producedItems: 0,
          startedAt: null,
          finishedAt: null
        }
        // Запрашиваем актуальное состояние у других: broadcast ping
        channel.value?.send({ type: 'broadcast', event: 'room:request_state', payload: {} })
      }

      // Добавляем себя, если отсутствуем
      if (!players.value.some(p => p.id === authStore.user!.id)) {
        players.value.push({
          id: authStore.user.id,
          name: authStore.user.email || 'Игрок',
          role: null,
          isReady: false,
          contributed: 0
        })
      }

      return true
    } catch (e: any) {
      error.value = e.message
      return false
    } finally {
      isConnecting.value = false
    }
  }

  async function joinChannel(roomId: string) {
    // Закрываем прошлый канал
    if (channel.value) {
      await supabase.removeChannel(channel.value as RealtimeChannel)
      channel.value = null
    }

    const ch = supabase.channel(`team_prod:${roomId}`)

    ch.on('presence', { event: 'sync' }, () => {
      const state: Record<string, any[]> = ch.presenceState() as any
      const connectedIds = Object.keys(state)
      // Обновляем локальный список игроков, не теряя поля
      const newPlayers: TeamPlayer[] = connectedIds.map((id) => {
        const existing = players.value.find(p => p.id === id)
        return existing || { id, name: 'Игрок', role: null, isReady: false, contributed: 0 }
      })
      players.value = newPlayers
    })

    ch.on('broadcast', { event: 'room:update' }, ({ payload }) => {
      if (!payload) return
      room.value = payload.room
      if (Array.isArray(payload.players)) {
        // Мягкое слияние по id для сохранения прогресса
        const map = new Map<string, TeamPlayer>()
        players.value.forEach(p => map.set(p.id, p))
        payload.players.forEach((p: TeamPlayer) => map.set(p.id, { ...map.get(p.id), ...p }))
        players.value = Array.from(map.values())
      }
    })

    ch.on('broadcast', { event: 'player:update' }, ({ payload }) => {
      const idx = players.value.findIndex(p => p.id === payload.id)
      if (idx >= 0) players.value[idx] = { ...players.value[idx], ...payload }
    })

    ch.on('broadcast', { event: 'room:request_state' }, () => {
      // Отвечаем текущим состоянием
      ch.send({ type: 'broadcast', event: 'room:update', payload: { room: room.value, players: players.value } })
    })

    ch.subscribe(() => {})

    channel.value = ch
  }

  function setRole(role: TeamRole) {
    if (!authStore.user) return
    const idx = players.value.findIndex(p => p.id === authStore.user!.id)
    if (idx >= 0) {
      players.value[idx] = { ...players.value[idx], role }
      channel.value?.send({ type: 'broadcast', event: 'player:update', payload: players.value[idx] })
    }
  }

  function toggleReady() {
    if (!authStore.user) return
    const idx = players.value.findIndex(p => p.id === authStore.user!.id)
    if (idx >= 0) {
      const updated = { ...players.value[idx], isReady: !players.value[idx].isReady }
      players.value[idx] = updated
      channel.value?.send({ type: 'broadcast', event: 'player:update', payload: updated })
    }
  }

  function startGame() {
    if (!room.value || room.value.status !== 'lobby') return
    if (!isReadyToStart.value) return
    room.value = { ...room.value, status: 'active', startedAt: new Date().toISOString(), producedItems: 0 }
    channel.value?.send({ type: 'broadcast', event: 'room:update', payload: { room: room.value, players: players.value } })
  }

  function performAction() {
    // Упрощённая механика: любое действие добавляет прогресс, масштаб зависит от роли
    if (!authStore.user || !room.value || room.value.status !== 'active') return
    const roleMultiplier: Record<TeamRole, number> = { designer: 1, cutter: 2, sewer: 3, quality: 1 }
    const meIdx = players.value.findIndex(p => p.id === authStore.user!.id)
    if (meIdx < 0) return

    const role = players.value[meIdx].role
    const gain = role ? roleMultiplier[role] : 1
    players.value[meIdx] = { ...players.value[meIdx], contributed: players.value[meIdx].contributed + gain }
    room.value.producedItems = Math.min(room.value.targetItems, room.value.producedItems + gain)

    // Широковещательно обновляем
    channel.value?.send({ type: 'broadcast', event: 'room:update', payload: { room: room.value, players: players.value } })

    if (room.value.producedItems >= room.value.targetItems) {
      finishGame()
    }
  }

  function finishGame() {
    if (!room.value) return
    room.value = { ...room.value, status: 'finished', finishedAt: new Date().toISOString() }
    channel.value?.send({ type: 'broadcast', event: 'room:update', payload: { room: room.value, players: players.value } })
  }

  async function leaveRoom() {
    if (channel.value) {
      await supabase.removeChannel(channel.value as RealtimeChannel)
      channel.value = null
    }
    room.value = null
    players.value = []
  }

  return {
    room,
    players,
    you,
    isConnecting,
    error,
    isReadyToStart,
    progressPercent,
    createOrJoinRoom,
    setRole,
    toggleReady,
    startGame,
    performAction,
    finishGame,
    leaveRoom
  }
})


