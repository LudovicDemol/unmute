import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchWithAuth } from '@/lib/api'

export interface ScenarioListItem {
  id: string
  title: string
  description: string
  category: string
  domain: string
  firstname: string
  lastname: string
  age: number
  type: string
}

export interface ChecklistItem {
  id: string
  label: string
  category?: string
  completed?: boolean
}

export interface ScenarioDetail {
  id: string
  title: string
  description: string
  category: string
  domain: string
  difficulty: number
  systemPrompt: string
  checklist: ChecklistItem[]
  firstname: string
  lastname: string
  age: number
  type: string
  voice: string
}

export function useScenario() {
  const getScenarios = useCallback(
    () => fetchWithAuth<ScenarioListItem[]>('/scenarios'), []
  )
  const getScenarioDetail = useCallback(
    (id: string) => fetchWithAuth<ScenarioDetail>(`/scenarios/${id}`), []
  )
  return { getScenarios, getScenarioDetail }
}

export function useScenarios() {
  return useQuery<ScenarioListItem[]>({
    queryKey: ['scenarios'],
    queryFn: () => fetchWithAuth<ScenarioListItem[]>('/scenarios'),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

export function useScenarioDetail(id?: string) {
  return useQuery<ScenarioDetail>({
    queryKey: ['scenario', id],
    queryFn: () => fetchWithAuth<ScenarioDetail>(`/scenarios/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}