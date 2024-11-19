<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="flex items-center gap-2 mb-6">
      <CheckCircleIcon class="h-6 w-6" />
      <h1 class="text-2xl font-bold">Completed Tasks</h1>
    </div>

    <div class="mb-6">
      <input
        type="date"
        v-model="selectedDate"
        class="px-4 py-2 border rounded-lg shadow-sm"
      />
    </div>

    <div v-if="isLoading" class="text-gray-500">Loading tasks...</div>

    <div v-else-if="error" class="text-red-500 p-4 bg-red-50 rounded-lg">
      {{ error }}
    </div>

    <div v-else>
      <div
        v-if="tasks.length === 0"
        class="text-gray-500 p-4 bg-gray-50 rounded-lg"
      >
        No tasks completed on
        {{ format(new Date(selectedDate), "MMMM d, yyyy") }}
      </div>

      <div v-else class="space-y-4">
        <div class="font-medium text-gray-700">
          {{ tasks.length }} task{{ tasks.length !== 1 ? "s" : "" }} completed
        </div>

        <ul class="space-y-3">
          <li
            v-for="task in tasks"
            :key="task.id"
            class="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium">{{ task.content }}</h3>
                <p v-if="task.projectId" class="text-sm text-gray-600 mt-1">
                  Project: {{ task.projectId }}
                </p>
              </div>
              <span class="text-sm text-gray-500">
                {{ format(new Date(task.createdAt), "h:mm a") }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { TodoistApi, type Task } from "@doist/todoist-api-typescript";
import { format } from "date-fns";
import { CheckCircleIcon } from "@heroicons/vue/24/outline";

const apiToken = ref<string>(localStorage.getItem("api_token") || "");
const tasks = ref<Task[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const selectedDate = ref(new Date().toISOString().split("T")[0]);

const fetchCompletedTasks = async () => {
  if (!apiToken.value) return;

  isLoading.value = true;
  error.value = null;

  try {
    const api = new TodoistApi(apiToken.value);
    const completedTasks = await api.getTasks({ filter: "completed" });
    tasks.value = completedTasks.filter((task) => task.isCompleted);
  } catch (err) {
    error.value = "Failed to fetch completed tasks";
    console.error("Error:", err);
  } finally {
    isLoading.value = false;
  }
};

watch(selectedDate, () => {
  fetchCompletedTasks();
});

onMounted(() => {
  fetchCompletedTasks();
});
</script>
