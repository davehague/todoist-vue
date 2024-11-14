<template>
  <Dialog :open="!!task" @close="$emit('close')" class="relative z-50">
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel
        v-if="task"
        class="mx-auto max-w-2xl w-full rounded-lg bg-white p-6 shadow-xl"
      >
        <h2
          class="text-lg font-semibold text-gray-900 mb-4"
          v-html="renderMarkdown(task.content)"
        ></h2>

        <div class="space-y-4">
          <div>
            <h4 class="text-sm font-medium text-gray-700">Project</h4>
            <p class="text-sm text-gray-900">
              {{ task.project_name }}
              <span v-if="task.section_name"> / {{ task.section_name }}</span>
            </p>
          </div>

          <div v-if="task.description">
            <h4 class="text-sm font-medium text-gray-700">Description</h4>
            <p class="text-sm text-gray-900 prose prose-blue" v-html="renderMarkdown(task.description)"></p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <h4 class="text-sm font-medium text-gray-700">Priority</h4>
              <p class="text-sm text-gray-900">{{ task.priority }}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700">Due Date</h4>
              <p class="text-sm text-gray-900">
                {{ task.due?.date || "No due date" }}
              </p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700">Created</h4>
              <p class="text-sm text-gray-900">
                {{ new Date(task.created_at).toLocaleDateString() }}
              </p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700">Status</h4>
              <p class="text-sm text-gray-900">
                {{ task.is_completed ? "Completed" : "Active" }}
              </p>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-700">URL</h4>
            <a
              :href="task.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-blue-600 hover:underline"
            >
              Open in Todoist
            </a>
          </div>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel } from "@headlessui/vue";
import type { Task } from "../types/interfaces";
import { marked } from "marked";

defineProps<{
  task: Task | null;
}>();

defineEmits<{
  (e: "close"): void;
}>();

const renderMarkdown = (content: string) => {
  try {
    return marked(content);
  } catch {
    return content;
  }
};
</script>
