<template>
  <form @submit.prevent="onSubmit" class="bg-white dark:bg-dark-grey rounded-lg p-1">
    <div class="p-5 pr-3 flex flex-col gap-6 max-h-[90vh] overflow-y-scroll">
      <div class="flex justify-between items-center">
        <h4 class="text-black dark:text-white font-bold text-lg">
          {{ managerStore.boardForm.edit ? 'Edit Board' : 'Add New Board' }}
        </h4>
      </div>
      <BaseInput ref="inputTitle" v-model="board.name" inputName="Board Name" placeholder="e.g. Web Design" />
      <div class="flex flex-col gap-3">
        <p class="text-medium-grey dark:text-white text-xs font-bold">Board Columns</p>
        <div class="flex items-center justify-between gap-4" v-for="(column, index) in board.columns" :key="index">
          <BaseInput :ref="el => { inputs[index] = el }" v-model="column.name"
            :placeholder="columnsPlaceholders[index] ? columnsPlaceholders[index] : 'Your Column title...'" />
          <IconCross @click="deleteColumn(index)" class="cursor-pointer" />
        </div>
        <ButtonSecondaryLarge @click.stop="addColumn">+ Add New Column</ButtonSecondaryLarge>
      </div>
      <ButtonPrimaryLarge type="submit">
        {{ managerStore.boardForm.edit ? 'Save Changes' : 'Create New Board' }}
      </ButtonPrimaryLarge>
    </div>
  </form>
</template>
<script setup>
import { ref, reactive, onBeforeUpdate } from 'vue'
import { useBoardsStore } from '@/stores/boards.js';
import { useManagerStore } from '@/stores/manager.js';
import BaseInput from '@/components/form/BaseInput.vue';
import IconCross from '@/components/icons/IconCross.vue';
import ButtonPrimaryLarge from '@/components/buttons/PrimaryLarge.vue';
import ButtonSecondaryLarge from '@/components/buttons/SecondaryLarge.vue';
import axios from 'axios'

const boardsStore = useBoardsStore();
const managerStore = useManagerStore();

const inputTitle = ref(null)
const inputs = ref([])
const deleteColumns = [];

const board = reactive({
  id: '',
  name: '',
  order: 1,
  columns: []
})
const columnsPlaceholders = {
  0: 'e.g. Todo...',
  1: 'e.g. Doing...',
  2: 'e.g. Done...'
}
const deleteColumn = (index) => {
  if(!!board.columns[index]['id']){
    deleteColumns.push(board.columns[index])
  }

  if (board.columns.length === 2) {
    var newOrder =  board.columns.reduce((a, b) => {
      return Math.max(isNaN(a.order)? 0: a.order, isNaN(b.order)? 0 : b.order);
    }, 1);
    if(isNaN(newOrder)){
      newOrder = 1
    }else{
      newOrder = newOrder+ 1;
    }
    var removed = {name: '', order: newOrder, tasks: [] };
    board.columns[index] = removed;
  } else {
    board.columns.splice(index, 1)
  }
}
const addColumn = () => {
  var newOrder =  board.columns.reduce((a, b) => {
    return Math.max(isNaN(a.order)? 0: a.order, isNaN(b.order)? 0 : b.order);
  });
  if(isNaN(newOrder)){
    newOrder = 1
  }else{
    newOrder = newOrder+ 1;
  }

  board.columns.push({ name: '', order: newOrder, tasks: [] })
}
const onSubmit = async () => {
  if (validate()) {
    if (managerStore.boardForm.edit) {
      var data = await axios.post("/api/v1/boards", board);
      var newBoard = data.data;
      boardsStore.boards[boardsStore.selectedBoard] = newBoard
      
    } else {
      var newOrder =  boardsStore.boards.reduce((a, b) => {
        return Math.max(isNaN(a.order)? 0: a.order, isNaN(b.order)? 0 : b.order);
      }, 1);
      if(isNaN(newOrder)){
        newOrder = 1
      }else{
        newOrder = newOrder+ 1;
      }
      board.order = newOrder;
      var data = await axios.post("/api/v1/boards", board);
      var newBoard = data.data;
      boardsStore.boards.push(newBoard)
      boardsStore.selectedBoard = boardsStore.boards.length - 1
    }
    
    deleteColumns.forEach(c => {
      axios.delete("/api/v1/columns/" + c.id );
    })

    managerStore.hideOverlay()
  }
}
const validate = () => {
  let valid = true
  if (board.name.trim().length === 0) {
    valid = false
    inputTitle.value.error = true
  }
  inputs.value.forEach((e, index) => {
    if (board?.columns[index]?.name.trim().length === 0) {
      valid = false
      e.error = true
    }
  })
  return valid
}
//EDIT MODE
if (managerStore.boardForm.edit) {
  board.name = JSON.parse(JSON.stringify(boardsStore.boards[boardsStore.selectedBoard].name))
  board.id = JSON.parse(JSON.stringify(boardsStore.boards[boardsStore.selectedBoard].id))
  board.order = JSON.parse(JSON.stringify(boardsStore.boards[boardsStore.selectedBoard].order))
  board.columns = JSON.parse(JSON.stringify(boardsStore.getCurrentBoard.columns))
} else {
  board.columns = [{ id:'', name: '', order: 1, tasks: [] }, {id:'',  name: '', order: 2, tasks: [] }]
}
onBeforeUpdate(() => {
  inputs.value = []
})
</script>