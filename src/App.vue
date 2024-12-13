<template>
  <div class="p-4 md:p-12 max-w-none dark:bg-gray-900">
    <!-- API Token Input -->
    <div
      v-if="!tasks.length || showTokenInput"
      class="w-full max-w-6xl mx-auto space-y-6"
    >
      <div class="space-y-6 text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          Todoist Task Viewer
        </h1>
        <div class="space-y-3">
          <p class="text-lg text-gray-600 dark:text-gray-300">
            To get started:
          </p>
          <ol
            class="text-lg text-gray-600 dark:text-gray-300 list-decimal list-inside space-y-3"
          >
            <li>Go to Todoist Settings → Integrations → Developer</li>
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
          class="w-full px-6 py-3 text-lg border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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

    <div v-else class="w-full h-screen flex flex-col">
      <SearchBar
        v-model="searchQuery"
        :total-tasks="tasks.length"
        @clear="clearSearch"
        @copy="copyToClipboard"
      />
      <FilterBar :tasks="tasks" @update:filters="updateFilters" />
      <TaskList :tasks="sortedTasks" @select="selectedTask = $event" />

      <TaskModal :task="selectedTask" @close="selectedTask = null" />

      <!-- New Footer with Change Token Button -->
      <div class="mt-auto border-t dark:border-gray-700 p-4">
        <div class="max-w-6xl mx-auto flex items-center justify-between">
          <span class="text-sm text-gray-500 dark:text-gray-400 italic">
            Using Todoist API Token
          </span>
          <button
            @click="handleChangeToken"
            class="px-4 py-2 text-sm text-red-900 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
          >
            Change API Token
          </button>
        </div>
      </div>
    </div>

    <!-- Router View -->
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { Task, Project } from "./types/interfaces";
import { useSecureStorage } from "./utils/encryption";
import SearchBar from "./components/SearchBar.vue";
import TaskList from "./components/TaskList.vue";
import TaskModal from "./components/TaskModal.vue";
import FilterBar from "./components/FilterBar.vue";

// Initialize secure storage with 'todoist' namespace
const { setSecureItem, getSecureItem, removeSecureItem } =
  useSecureStorage("todoist");

const tasks = ref<Task[]>([]);
const filteredTasks = ref<Task[]>([]);
const searchQuery = ref("");
const selectedTask = ref<Task | null>(null);
const apiToken = ref("");
const showTokenInput = ref(false);
const isLoading = ref(false);

const filterSettings = ref({
  dueFilter: "all",
  label: "",
  sort: "created_desc",
  projectSection: "",
});

const sortedTasks = computed(() => {
  let filtered = filteredTasks.value;

  // Apply project and section filter
  if (filterSettings.value.projectSection) {
    const [project, section] = filterSettings.value.projectSection.split(" > ");
    filtered = filtered.filter((task) => {
      if (section) {
        return task.project_name === project && task.section_name === section;
      }
      return task.project_name === project;
    });
  }

  // Apply due date filter
  if (filterSettings.value.dueFilter !== "all") {
    const today = new Date().toISOString().split("T")[0];
    filtered = filtered.filter((task) => {
      switch (filterSettings.value.dueFilter) {
        case "today":
          return task.due?.date && task.due.date <= today;
        case "has_due":
          return !!task.due;
        case "no_due":
          return !task.due;
        default:
          return true;
      }
    });
  }

  // Apply label filter
  if (filterSettings.value.label) {
    filtered = filtered.filter((task) =>
      task.labels?.includes(filterSettings.value.label)
    );
  }

  // Apply sorting
  return [...filtered].sort((a, b) => {
    switch (filterSettings.value.sort) {
      case "due_asc":
        return (a.due?.date || "9999") > (b.due?.date || "9999") ? 1 : -1;
      case "due_desc":
        return (a.due?.date || "9999") < (b.due?.date || "9999") ? 1 : -1;
      case "created_asc":
        return a.created_at > b.created_at ? 1 : -1;
      case "created_desc":
        return a.created_at < b.created_at ? 1 : -1;
      case "project":
        return a.project_name.localeCompare(b.project_name);
      case "content":
        return a.content.localeCompare(b.content);
      default:
        return 0;
    }
  });
});

const handleSearch = () => {
  const query = searchQuery.value.toLowerCase();
  filteredTasks.value = tasks.value.filter(
    (task) =>
      task.content.toLowerCase().includes(query) ||
      task.project_name.toLowerCase().includes(query) ||
      (task.section_name?.toLowerCase().includes(query) ?? false) ||
      (task.due?.date || "").includes(query)
  );
};

const clearSearch = () => {
  searchQuery.value = "";
  handleSearch();
};

const handleChangeToken = async () => {
  if (
    confirm(
      "Are you sure you want to change the API token? This will clear your current view."
    )
  ) {
    showTokenInput.value = true;
    tasks.value = [];
    filteredTasks.value = [];
    apiToken.value = "";
    await removeSecureItem("api_token");
  }
};

const copyToClipboard = async (event: MouseEvent, limit?: number) => {
  event.preventDefault();
  const tasksToCopy = limit
    ? filteredTasks.value.slice(0, limit)
    : filteredTasks.value;
  const text = tasksToCopy
    .map((task: Task) => {
      const dueStr = task.due ? task.due.date : "No due date";
      const createdStr = task.created_at
        ? new Date(task.created_at).toLocaleDateString()
        : "Unknown";
      return `${task.content} | Created: ${createdStr} |  Due: ${dueStr}`;
    })
    .join("\n");

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};

const fetchTasks = async () => {
  if (!apiToken.value) return;

  isLoading.value = true;
  try {
    // Save the API token securely
    await setSecureItem("api_token", apiToken.value);

    // Fetch projects
    const projectsResponse = await fetch(
      "https://api.todoist.com/rest/v2/projects",
      {
        headers: {
          Authorization: `Bearer ${apiToken.value}`,
        },
      }
    );

    if (!projectsResponse.ok) {
      throw new Error("Failed to fetch projects");
    }

    const projects: Project[] = await projectsResponse.json();
    const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

    // Fetch sections
    const sectionsResponse = await fetch(
      "https://api.todoist.com/rest/v2/sections",
      {
        headers: {
          Authorization: `Bearer ${apiToken.value}`,
        },
      }
    );

    if (!sectionsResponse.ok) {
      throw new Error("Failed to fetch sections");
    }

    const sections = await sectionsResponse.json();
    const sectionMap = Object.fromEntries(
      sections.map((s: any) => [s.id, s.name])
    );

    // Fetch tasks
    const tasksResponse = await fetch("https://api.todoist.com/rest/v2/tasks", {
      headers: {
        Authorization: `Bearer ${apiToken.value}`,
      },
    });

    if (!tasksResponse.ok) {
      throw new Error("Failed to fetch tasks");
    }

    const rawTasks = await tasksResponse.json();

    console.log("Fetched task 0: ", rawTasks[0]);
    tasks.value = rawTasks.map((task: Task) => ({
      ...task,
      project_name: projectMap[task.project_id] || "No Project",
      section_name: task.section_id ? sectionMap[task.section_id] : null,
    }));
    filteredTasks.value = tasks.value;
    showTokenInput.value = false;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    alert("Error fetching tasks. Please check your API token.");
    await removeSecureItem("api_token");
  } finally {
    isLoading.value = false;
  }
};

// Load saved token and fetch tasks on mount
onMounted(async () => {
  const savedToken = await getSecureItem("api_token");
  if (savedToken) {
    apiToken.value = savedToken;
    await fetchTasks();
  }
});

// Watch for search query changes
watch(searchQuery, handleSearch);

const updateFilters = (filters: {
  dueFilter: string;
  label: string;
  sort: string;
  projectSection: string;
}) => {
  filterSettings.value = filters;
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
