import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Plusicon from '../icons/Plusicon'
import { Column, Id, Task } from '../types'
import ColumnContainer from './ColumnContainer'
import TaskCard from './TaskCard'

function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([])

  const [columns, setColumns] = useState<Column[]>([])

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns])

  const [activeColumn, setActiveColumn] = useState<Column | null>(null)

  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensor = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3 //移动3px,触发pointer
      }
    })
  )

  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `列 ${columns.length + 1}`
    }
    setColumns([...columns, columnToAdd])
  }

  const generateId = () => {
    return Math.floor(Math.random() * 10001)
  }

  const deleteColumn = (id: Id) => {
    // 过滤出不是当前id的列
    const filterColumns = columns.filter((column) => column.id !== id)
    // 设置新的列
    setColumns(filterColumns)

    const newTasks = tasks.filter((task) => task.columnId !== id)
    setTasks(newTasks)
  }

  const updateColumn = (id: Id, title: string) => {
    // 遍历columns数组，如果当前id不等于传入的id，则返回新的column
    const newColumns = columns.map((column) => {
      if (column.id !== id) {
        return column
      }
      // 否则，返回新的column，并将传入的title更新
      return { ...column, title }
    })
    // 设置新的columns
    setColumns(newColumns)
  }

  const createTask = (columnId: Id) => {
    // 创建一个新的任务
    const newTask: Task = {
      // 任务的id
      id: generateId(),
      // 任务的列id
      columnId,
      // 任务的内容
      content: `Task ${tasks.length + 1}`
    }

    // 将新任务添加到tasks数组中
    setTasks([...tasks, newTask])
  }

  const deleteTask = (id: Id) => {
    const newTasks = tasks.filter((task) => task.id !== id)
    setTasks(newTasks)
  }

  const updateTask = (id: Id, content: string) => {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) {
        return task
      }
      return { ...task, content }
    })
    setTasks(newTasks)
  }

  const onDragStart = (event: DragStartEvent) => {
    console.log('[ Drag Start event ] >', event)
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column)
      return
    }

    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task)
      return
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null)
    setActiveTask(null)
    console.log('[ DragEndEvent ] >', event)
    const { active, over } = event
    if (!over) return
    const activeColumnId = active.id
    const overColumnId = over.id

    if (activeColumnId === overColumnId) return

    const isActiveAsColmun = active.data.current?.type === 'Column'
    if (!isActiveAsColmun) return

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((column) => column.id === activeColumnId)
      const overColumnIndex = columns.findIndex((column) => column.id === overColumnId)

      return arrayMove(columns, activeColumnIndex, overColumnIndex)
    })
  }

  const onDragOver = (event: DragOverEvent) => {
    console.log('[ event ] >', event)
    const { active, over } = event
    if (!over) return
    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveAsTask = active.data.current?.type === 'Task'
    const isOverAsTask = over.data.current?.type === 'Task'

    if (!isActiveAsTask) return

    //1.task 拖动到 task 上
    if (isActiveAsTask && isOverAsTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((task) => task.id === activeId)
        const overIndex = tasks.findIndex((task) => task.id === overId)

        tasks[activeIndex].columnId = tasks[overIndex].columnId

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }

    const isOverAsColumn = over.data.current?.type === 'Column'

    //2.task 拖动到 colmun上
    if (isActiveAsTask && isOverAsColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((task) => task.id === activeId)
        tasks[activeIndex].columnId = overId
        //触发重新渲染
        return arrayMove(tasks, activeIndex, activeIndex)
      })
    }
  }

  return (
    <div
      className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden
    px-[40px]"
    >
      <DndContext
        sensors={sensor}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <SortableContext items={columnsId}>
          <div className="m-auto flex gap-4">
            <div className="flex gap-2">
              {columns.map((column) => (
                <ColumnContainer
                  column={column}
                  key={column.id}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === column.id)}
                />
              ))}
            </div>
            <button
              onClick={() => {
                createNewColumn()
              }}
              className="
                h-[60px] 
                w-[350px] 
                min-w=[350px] 
                cursor-pointer
                rounded-lg
              bg-mainBackgroundColor
                border-2
              border-mainBackgroundColor
                p-4
              ring-rose-500
                hover:ring-2
                flex
                gap-2"
            >
              <Plusicon />
              新增列
            </button>
          </div>

          {createPortal(
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  column={activeColumn}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                />
              )}
              {activeTask && (
                <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />
              )}
            </DragOverlay>,
            document.body
          )}
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default KanbanBoard
