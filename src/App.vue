<template>
  <div class="p-12 max-w-none">
    <!-- API Token Input -->
    <div
      v-if="!tasks.length || showTokenInput"
      class="max-w-6xl mx-auto space-y-6"
    >
      <div class="space-y-6 text-center">
        <h1 class="text-4xl font-bold text-gray-900">Todoist Task Viewer</h1>
        <div class="space-y-3">
          <p class="text-lg text-gray-600">To get started:</p>
          <ol class="text-lg text-gray-600 list-decimal list-inside space-y-3">
            <li>Go to Todoist Settings → Integrations</li>
            <li>Copy your API token</li>
            <li>Paste it below to load your tasks</li>
          </ol>
        </div>
      </div>

      <div class="space-y-2">
        <input
          type="password"
          v-model="apiToken"
          placeholder="Enter your Todoist API token"
          class="w-full px-6 py-3 text-lg border rounded-lg"
        />
        <button
          @click="fetchTasks"
          :disabled="isLoading"
          class="w-full px-6 py-3 text-lg bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <svg
            v-if="isLoading"
            class="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ isLoading ? "Loading Tasks..." : "Load Tasks" }}
        </button>
      </div>
    </div>

    <div v-else class="w-full min-w-[800px] h-screen flex flex-col">
      <!-- Fixed Control Bar -->
      <div class="bg-white py-4 z-10 w-full border-b">
        <div class="flex gap-2 max-w-[800px] min-w-[800px] mx-auto">
          <div class="relative flex-1">
            <MagnifyingGlassIcon
              class="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            />
            <input
              type="text"
              :placeholder="`Search ${tasks.length} tasks...`"
              class="w-full pl-10 pr-4 py-2 text-sm border rounded-lg"
              v-model="searchQuery"
              @input="handleSearch"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 border-none"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="relative">
            <button
              @click="toggleDropdown"
              :disabled="isCopying"
              class="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <CheckIcon v-if="isCopying" class="h-4 w-4" />
              {{ isCopying ? "Copied!" : "Copy Tasks" }}
              <span class="ml-2">▼</span>
            </button>
            <div
              v-if="showDropdown"
              class="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg"
            >
              <button
                @click="copyAndClose($event)"
                class="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                Copy All
              </button>
              <button
                @click="copyAndClose($event, 10)"
                class="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                Copy Top 10
              </button>
              <button
                @click="copyAndClose($event, 20)"
                class="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                Copy Top 20
              </button>
              <button
                @click="copyAndClose($event, 50)"
                class="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                Copy Top 50
              </button>
            </div>
          </div>
          <button
            @click="showTokenInput = true"
            class="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Change Token
          </button>
        </div>
      </div>

      <!-- Task List -->
      <div class="flex-1 overflow-y-auto">
        <div class="space-y-2 pt-4 max-w-[800px] min-w-[800px] mx-auto">
          <div
            v-for="task in sortedTasks"
            :key="task.id"
            @click="selectedTask = task"
            class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div class="flex flex-col gap-1">
              <span
                class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit"
              >
                {{ task.project_name }}
              </span>
              <div class="flex justify-between items-center">
                <h3
                  class="text-sm font-medium text-gray-900"
                  v-html="renderMarkdown(task.content)"
                ></h3>
                <div class="flex flex-col items-end">
                  <span
                    v-if="task.due"
                    class="text-xs text-gray-500 whitespace-nowrap"
                  >
                    Due: {{ new Date(task.due.date).toLocaleDateString() }}
                  </span>
                  <span
                    v-if="task.created_at"
                    class="text-xs text-gray-500 whitespace-nowrap"
                  >
                    Created:
                    {{ new Date(task.created_at).toLocaleDateString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Detail Modal -->
    <Dialog
      :open="!!selectedTask"
      @close="selectedTask = null"
      class="relative z-50"
    >
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          v-if="selectedTask"
          class="mx-auto max-w-2xl w-full rounded-lg bg-white p-6 shadow-xl"
        >
          <h2
            class="text-lg font-semibold text-gray-900 mb-4"
            v-html="renderMarkdown(selectedTask.content)"
          ></h2>

          <div class="space-y-4">
            <div>
              <h4 class="text-sm font-medium text-gray-700">Project</h4>
              <p class="text-sm text-gray-900">
                {{ selectedTask.project_name }}
              </p>
            </div>

            <div v-if="selectedTask.description">
              <h4 class="text-sm font-medium text-gray-700">Description</h4>
              <p class="text-sm text-gray-900">
                {{ selectedTask.description }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <h4 class="text-sm font-medium text-gray-700">Priority</h4>
                <p class="text-sm text-gray-900">{{ selectedTask.priority }}</p>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-700">Due Date</h4>
                <p class="text-sm text-gray-900">
                  {{ selectedTask.due?.date || "No due date" }}
                </p>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-700">Created</h4>
                <p class="text-sm text-gray-900">
                  {{ new Date(selectedTask.created_at).toLocaleDateString() }}
                </p>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-700">Status</h4>
                <p class="text-sm text-gray-900">
                  {{ selectedTask.is_completed ? "Completed" : "Active" }}
                </p>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-700">URL</h4>
              <a
                :href="selectedTask.url"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Dialog, DialogPanel } from "@headlessui/vue";
import { MagnifyingGlassIcon, CheckIcon } from "@heroicons/vue/24/outline";
import { marked } from "marked";

interface Task {
  id: string;
  content: string;
  project_name: string;
  due?: {
    date: string;
    is_recurring: boolean;
    string: string;
  };
  description: string;
  priority: number;
  created_at: string;
  is_completed: boolean;
  labels: string[];
  url: string;
}

const tasks = ref<Task[]>([]);
const filteredTasks = ref<Task[]>([]);
const searchQuery = ref("");
const selectedTask = ref<Task | null>(null);

const apiToken = ref("");
const showTokenInput = ref(false);

const isLoading = ref(false);
const isCopying = ref(false);
const showDropdown = ref(false);

const sortedTasks = computed(() => {
  return [...filteredTasks.value].sort((a, b) => {
    const dateA = a.created_at || "0000-01-01";
    const dateB = b.created_at || "0000-01-01";
    return dateB.localeCompare(dateA);
  });
});

const handleSearch = () => {
  const query = searchQuery.value.toLowerCase();
  filteredTasks.value = tasks.value.filter(
    (task) =>
      task.content.toLowerCase().includes(query) ||
      task.project_name.toLowerCase().includes(query) ||
      (task.due?.date || "").includes(query)
  );
};

const renderMarkdown = (content: string) => {
  try {
    return marked(content);
  } catch {
    return content;
  }
};

const copyToClipboard = async (event: MouseEvent, limit?: number) => {
  event.preventDefault();
  const tasksToCopy = limit ? tasks.value.slice(0, limit) : tasks.value;
  const text = tasksToCopy
    .map((task) => {
      const dueStr = task.due ? task.due.date : "No due date";
      const createdStr = task.created_at
        ? new Date(task.created_at).toLocaleDateString()
        : "Unknown";
      return `${task.content} | Created: ${createdStr} |  Due: ${dueStr}`;
    })
    .join("\n");

  try {
    await navigator.clipboard.writeText(text);
    isCopying.value = true;
    setTimeout(() => {
      isCopying.value = false;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};

const copyAndClose = async (event: MouseEvent, limit?: number) => {
  await copyToClipboard(event, limit);
  showDropdown.value = false;
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const clearSearch = () => {
  searchQuery.value = "";
  handleSearch();
};

const fetchTasks = async () => {
  isLoading.value = true;
  try {
    const projectsResponse = await fetch(
      "https://api.todoist.com/rest/v2/projects",
      {
        headers: {
          Authorization: `Bearer ${apiToken.value}`,
        },
      }
    );
    const projects = await projectsResponse.json();
    const projectMap = Object.fromEntries(
      projects.map((p: { id: any; name: any }) => [p.id, p.name])
    );

    const tasksResponse = await fetch("https://api.todoist.com/rest/v2/tasks", {
      headers: {
        Authorization: `Bearer ${apiToken.value}`,
      },
    });
    const rawTasks = await tasksResponse.json();

    tasks.value = rawTasks.map((task: Task) => ({
      ...task,
      project_name: projectMap[task.project_name] || "No Project",
    }));
    filteredTasks.value = tasks.value;
    showTokenInput.value = false;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    alert("Error fetching tasks. Please check your API token.");
  } finally {
    isLoading.value = false;
  }
};
</script>

<style>
.markdown {
  color: rgb(17, 24, 39);
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.markdown a {
  color: rgb(37, 99, 235);
}
.markdown a:hover {
  text-decoration: underline;
}
.markdown p {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}
</style>
