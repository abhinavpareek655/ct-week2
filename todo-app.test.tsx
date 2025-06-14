import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import React from 'react'
import TodoApp from './todo-app'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'

let container: HTMLDivElement
let root: Root

function getAddButton() {
  return Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Add')) as HTMLButtonElement
}

function getFilterSelect() {
  return container.querySelectorAll('select')[0] as HTMLSelectElement | null
}

function getSortSelect() {
  return container.querySelectorAll('select')[1] as HTMLSelectElement | null
}

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  localStorage.clear()
  act(() => {
    root = createRoot(container)
    root.render(<TodoApp />)
  })
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  document.body.removeChild(container)
})

function addTask(text: string) {
  const input = container.querySelector('input') as HTMLInputElement
  act(() => {
    input.value = text
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  const addButton = getAddButton()
  act(() => {
    addButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

describe('TodoApp', () => {
  it('adds tasks and stores them in localStorage', () => {
    addTask('Test task')
    expect(container.textContent).toContain('Test task')
    const stored = JSON.parse(localStorage.getItem('todo-tasks') || '[]')
    expect(stored[0].text).toBe('Test task')
  })

  it('prevents adding duplicate tasks', () => {
    addTask('task')
    addTask('task')
    expect(container.textContent?.match(/task/g)?.length).toBe(1)
  })

  it('removes tasks', () => {
    addTask('delete me')
    const removeButton = Array.from(container.querySelectorAll('button')).find(b => b.querySelector('svg')) as HTMLButtonElement
    act(() => {
      removeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(container.textContent).not.toContain('delete me')
  })

  it('toggles completion and filters active tasks', () => {
    addTask('complete me')
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    act(() => {
      checkbox.click()
    })
    expect(checkbox.checked).toBe(true)

    const filter = getFilterSelect()
    if (filter) {
      act(() => {
        filter.value = 'active'
        filter.dispatchEvent(new Event('change', { bubbles: true }))
      })
      expect(container.textContent).not.toContain('complete me')
    }
  })

  it('sorts tasks alphabetically', () => {
    addTask('b task')
    addTask('a task')
    const sort = getSortSelect()
    if (sort) {
      act(() => {
        sort.value = 'alphabetical'
        sort.dispatchEvent(new Event('change', { bubbles: true }))
      })
    }
    const items = Array.from(container.querySelectorAll('p')).map(p => p.textContent)
    expect(items[0]).toBe('a task')
  })
})

