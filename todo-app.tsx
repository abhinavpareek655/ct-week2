"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Calendar, CheckCircle, Circle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  priority: "low" | "medium" | "high"
}

type FilterType = "all" | "active" | "completed"
type SortType = "date" | "alphabetical" | "priority" | "completion"

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [sort, setSort] = useState<SortType>("date")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [error, setError] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("todo-tasks")
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }))
        setTasks(parsedTasks)
      } catch (error) {
        console.error("Error loading tasks from localStorage:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("todo-tasks", JSON.stringify(tasks))
    }
  }, [tasks, isLoaded])

  // Input validation
  const validateTask = (text: string): string => {
    if (!text.trim()) {
      return "Task cannot be empty"
    }
    if (text.trim().length < 3) {
      return "Task must be at least 3 characters long"
    }
    if (text.trim().length > 512) {
      return "Task cannot exceed 512 characters"
    }
    if (tasks.some((task) => task.text.toLowerCase() === text.trim().toLowerCase())) {
      return "Task already exists"
    }
    return ""
  }

  // Add new task
  const addTask = () => {
    const validationError = validateTask(newTask)
    if (validationError) {
      setError(validationError)
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      createdAt: new Date(),
      priority,
    }

    setTasks((prev) => [...prev, task])
    setNewTask("")
    setError("")
  }

  // Remove task
  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  // Toggle task completion
  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  // Clear all completed tasks
  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.completed))
  }

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks

    // Apply filter
    switch (filter) {
      case "active":
        filtered = tasks.filter((task) => !task.completed)
        break
      case "completed":
        filtered = tasks.filter((task) => task.completed)
        break
      default:
        filtered = tasks
    }

    // Apply sort
    return filtered.sort((a, b) => {
      switch (sort) {
        case "alphabetical":
          return a.text.localeCompare(b.text)
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "completion":
          return Number(a.completed) - Number(b.completed)
        case "date":
        default:
          return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })
  }, [tasks, filter, sort])

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.completed).length
    const active = total - completed
    return { total, completed, active }
  }, [tasks])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-blue-600" />
            Advanced Todo List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Task Section */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter a new task..."
                value={newTask}
                onChange={(e) => {
                  setNewTask(e.target.value)
                  if (error) setError("")
                }}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addTask} className="px-6">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Statistics */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Total: {stats.total}</span>
            <span>Active: {stats.active}</span>
            <span>Completed: {stats.completed}</span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">Filter:</span>
              <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">Sort by:</span>
              <Select value={sort} onValueChange={(value: SortType) => setSort(value)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Created</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="completion">Completion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {stats.completed > 0 && (
              <Button variant="outline" size="sm" onClick={clearCompleted}>
                Clear Completed
              </Button>
            )}
          </div>

          {/* Task List */}
          <div className="space-y-2">
            {filteredAndSortedTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {tasks.length === 0 ? (
                  <div className="space-y-2">
                    <Circle className="h-12 w-12 mx-auto opacity-50" />
                    <p>No tasks yet. Add one above!</p>
                  </div>
                ) : (
                  <p>No tasks match the current filter.</p>
                )}
              </div>
            ) : (
              filteredAndSortedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${
                    task.completed ? "bg-muted/50" : "bg-background"
                  }`}
                >
                  <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />

                  <div className="flex-1 min-w-0">
                    <p className={`${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {task.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTask(task.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
