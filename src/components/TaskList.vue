<template>
  <div class="flex-1 overflow-y-auto">
    <div class="space-y-2 pt-4 max-w-[800px] min-w-[800px] mx-auto">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @click="$emit('select', task)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from "../types/interfaces";
import TaskItem from "./TaskItem.vue";

defineProps<{
  tasks: Task[];
}>();

defineEmits<{
  (e: "select", task: Task): void;
}>();
</script>
