<template>
  <div
    class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
    @click="$emit('click')"
  >
    <div class="flex flex-col gap-1">
      <div class="flex gap-2">
        <span
          class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit"
        >
          {{ task.project_name }}
        </span>
        <span
          v-if="task.section_name"
          class="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full w-fit"
        >
          {{ task.section_name }}
        </span>
      </div>
      <div class="flex justify-between items-center">
        <h3
          class="text-sm font-medium text-gray-900"
          v-html="renderMarkdown(task.content)"
        ></h3>
        <div class="flex flex-col items-end">
          <span v-if="task.due" class="text-xs text-gray-500 whitespace-nowrap">
            Due: {{ new Date(task.due.date).toLocaleDateString() }}
          </span>
          <span
            v-if="task.created_at"
            class="text-xs text-gray-500 whitespace-nowrap"
          >
            Created: {{ new Date(task.created_at).toLocaleDateString() }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from "../types/interfaces";
import { marked } from "marked";

defineProps<{
  task: Task;
}>();

defineEmits<{
  (e: "click"): void;
}>();

const renderMarkdown = (content: string) => {
  try {
    return marked(content);
  } catch {
    return content;
  }
};
</script>
