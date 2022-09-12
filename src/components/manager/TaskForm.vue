<template>
  <form @submit.prevent="onSubmit" class="bg-white dark:bg-dark-grey rounded-lg p-1">
    <div class="p-5 pr-3 flex flex-col gap-6 max-h-[90vh] overflow-y-scroll">
      <div class="flex justify-between items-center">
        <h4 class="text-black dark:text-white font-bold text-lg">
          {{ managerStore.taskForm.edit ? 'Edit Task' : 'Add New Task' }}
        </h4>
      </div>
      <BaseInput ref="inputTitle" v-model="form.task.title" inputName="Title" placeholder="e.g. Take coffee break" />
      <BaseTextarea v-model="form.task.description" inputName="Description"
        placeholder="e.g. It’s always good to take a break. This 15 minute break will  recharge the batteries a little." />
      <div class="flex flex-col gap-3">
        <p class="text-medium-grey text-xs font-bold">Subtasks</p>
        <div ref="errorSubtasks" class="flex items-center justify-between gap-4"
          v-for="(subtask, index) in form.task.subtasks" :key="index">
          <BaseInput :ref="el => { inputs[index] = el }" v-model="subtask.title"
            :placeholder="subtaskPlaceholders[index] ? subtaskPlaceholders[index] : 'Your subtask title...'" />
          <IconCross @click="deleteSubtask(index)" class="cursor-pointer" />
        </div>
        <ButtonSecondaryLarge type="button" @click.stop="addSubtask">+ Add New Subtask</ButtonSecondaryLarge>
      </div>
      <div class="flex flex-col gap-2">
        <p class="text-medium-grey text-xs font-bold">Status</p>
        <BaseSelect @onClickOption="updateColumn" :value="columnName" />
      </div>
      <ButtonPrimaryLarge type="submit">
        {{ managerStore.taskForm.edit ? 'Save Changes' : 'Create Task' }}
      </ButtonPrimaryLarge>
    </div>
  </form>
</template>
<script setup>
import { ref, reactive, onBeforeUpdate } from 'vue'
import { useBoardsStore } from '@/stores/boards.js';
import { useManagerStore } from '@/stores/manager.js';
import BaseSelect from '@/components/form/BaseSelect.vue';
import BaseInput from '@/components/form/BaseInput.vue';
import BaseTextarea from '../form/BaseTextarea.vue';
import IconCross from '../icons/IconCross.vue';
import ButtonPrimaryLarge from '../buttons/PrimaryLarge.vue';
import ButtonSecondaryLarge from '../buttons/SecondaryLarge.vue';
import axios from 'axios'

const boardsStore = useBoardsStore();
const managerStore = useManagerStore();
const columnName = ref('')

const inputTitle = ref(null)
const inputs = ref([])
const deleteSubtasks = [];

const form = reactive({
  task: {
    title: '',
    description: '',
    columnId: '',
    order: 1,
    subtasks: [{ title: '', order: 1, isCompleted: false }, { title: '', order: 2,  isCompleted: false }]
  },
  column: 0
})
const subtaskPlaceholders = {
  0: 'e.g. Make coffee',
  1: 'e.g. Drink coffee & smile'
}
const deleteSubtask = (index) => {
  if(!!form.task.subtasks[index]['id']){
    deleteSubtasks.push(form.task.subtasks[index])
  }

  if (form.task.subtasks.length === 2) {
    var newOrder =  form.task.subtasks.reduce((a, b) => {
      return Math.max(isNaN(a.order)? 0: a.order, isNaN(b.order)? 0 : b.order);
    });
    if(isNaN(newOrder)){
      newOrder = 1
    }else{
      newOrder = newOrder+ 1;
    }
    var removed = {title: '', order: newOrder, isCompleted: false };
    form.task.subtasks[index] = removed;

  } else {
    form.task.subtasks.splice(index, 1)
  }
}
const addSubtask = () => {
  var newOrder =  form.task.subtasks.reduce((a, b) => {
    return Math.max(isNaN(a.order)? 0: a.order, isNaN(b.order)? 0 : b.order);
  });
  if(isNaN(newOrder)){
    newOrder = 1
  }else{
    newOrder = newOrder+ 1;
  }

  form.task.subtasks.push({ title: '', order: newOrder, isCompleted: false })
}
const onSubmit = async () => {
  if (validate()) {
    if (managerStore.taskForm.edit) {
      
      var data = await axios.post("/api/v1/tasks", form.task);
      var newTask = data.data;
      boardsStore.saveTaskChanges({ task: newTask, column: form.column })
    } else {
      var newOrder = boardsStore.getColumns[form.column].tasks.reduce((a, b) => {
        return Math.max(isNaN(a.order)? 0: a.order, isNaN(b.order)? 0 : b.order);
      }, 1);
      if(isNaN(newOrder)){
        newOrder = 1
      }else{
        newOrder = newOrder+ 1;
      }
      form.task.order = newOrder;
      var data = await axios.post("/api/v1/tasks", form.task);
      var newTask = data.data;
      boardsStore.getColumns[form.column].tasks.push(newTask)
    }

    deleteSubtasks.forEach(s => {
      axios.delete("/api/v1/subtasks/" + s.id);
    })


    managerStore.hideOverlay()
  }
}
const validate = () => {
  let valid = true
  if (form.task.title.trim().length === 0) {
    valid = false
    inputTitle.value.error = true
  }
  inputs.value.forEach((e, index) => {
    if (form.task.subtasks[index]?.title.trim().length === 0) {
      valid = false
      e.error = true
    }
  })
  return valid
}
const updateColumn = ({ index, name, column }) => {
  form.column = index
  form.task.columnId = column.id
  columnName.value = name
}

//EDIT MODE
if (managerStore.taskForm.edit) {
  form.task = JSON.parse(JSON.stringify(boardsStore.getTask))
  form.column = JSON.parse(JSON.stringify(boardsStore.selectedColumn))
  columnName.value = JSON.parse(JSON.stringify(boardsStore.getColumnsNames[boardsStore.selectedColumn]))
} else {
  columnName.value = JSON.parse(JSON.stringify(boardsStore.getColumnsNames[0]))
  form.task.columnId = JSON.parse(JSON.stringify(boardsStore.getColumnsIds[0]))
  console.log(form.task.columnId)
}

onBeforeUpdate(() => {
  inputs.value = []
})
</script>