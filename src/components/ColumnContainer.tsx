import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo, useState } from 'react'
import Plusicon from '../icons/Plusicon'
import Trashicon from '../icons/Trashicon'
import { Column, Id, Task } from '../types'
import TaskCard from './TaskCard'

interface Props {
  column: Column
  deleteColumn: (id: Id) => void
  updateColumn: (id: Id, title: string) => void

  createTask: (id: Id) => void
  deleteTask: (id: Id) => void
  updateTask: (id: Id, content: string) => void
  tasks: Task[]
}

const ColumnContainer = (props: Props) => {
  const { column, deleteColumn, updateColumn, createTask, deleteTask, updateTask, tasks } = props

  const [editMode, setEditMode] = useState(false)

  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks])

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column
    },
    disabled: editMode
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-mainBackgroundColor opacity-40 border-2 border-rose-500 w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
      ></div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-mainBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        className="bg-mainBackgroundColor text-md h-[60px] rounded-md rounded-b-none p-3 font-bold border-columBackgroundColor border-4 flex items-center justify-between"
        onClick={() => {
          // 设置编辑模式
          setEditMode(true)
        }}
      >
        <div className="flex gap-2">
          <div className="flex justify-center items-center bg-columBackgroundColor px-2 py-1 text-sm rounded-xl">
            0
          </div>
          {!editMode && column.title}
          {editMode && (
            <input
              className="bg-black focus:border-rose-500 border rounded outline-none px-2"
              value={column.title}
              autoFocus
              onChange={(e) => {
                // 更新列标题
                updateColumn(column.id, e.target.value)
              }}
              onBlur={() => {
                // 设置编辑模式
                setEditMode(false)
              }}
              onKeyDown={(e) => {
                // 如果按下回车键，则设置编辑模式
                if (e.key !== 'Enter') return
                setEditMode(false)
              }}
            />
          )}
        </div>
        <button
          className="stroke-gray-500 hover:stroke-white hover:bg-columBackgroundColor rounded px-1 py-2"
          onClick={() => {
            // 删除列
            deleteColumn(column.id)
          }}
        >
          <Trashicon />
        </button>
      </div>
      <div className="bg-columBackgroundColor flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} />
          ))}
        </SortableContext>
      </div>
      <button
        className="flex gap-2 items-center border-columBackgroundColor border-2 rounded-md p-4
      border-x-columBackgroundColor hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black"
        onClick={() => {
          // 新增任务
          createTask(column.id)
        }}
      >
        <Plusicon />
        新增任务
      </button>
    </div>
  )
}

export default ColumnContainer
