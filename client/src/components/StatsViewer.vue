<template>
  <div class="stats-viewer">
    <h2>Chat Statistics</h2>
    <form @submit.prevent="fetchStats" class="stats-form">
      <div class="form-group">
        <label for="startDate">Start Date</label>
        <input
          type="date"
          id="startDate"
          v-model="startDate"
          class="futuristic-input"
          placeholder="YYYY-MM-DD"
        />
      </div>
      <div class="form-group">
        <label for="endDate">End Date</label>
        <input
          type="date"
          id="endDate"
          v-model="endDate"
          class="futuristic-input"
          placeholder="YYYY-MM-DD"
        />
      </div>
      <div class="button-group">
        <button type="submit" class="futuristic-button">Fetch Statistics</button>
        <button type="button" @click="clearDates" class="futuristic-button clear-button">Clear Dates</button>
      </div>
    </form>

    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <transition-group
      name="fade"
      tag="table"
      class="stats-table"
      v-if="stats.length"
    >
      <thead key="thead">
        <tr>
          <th>Website ID</th>
          <th>Total Chats</th>
          <th>Missed Chats</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stat in stats" :key="stat.websiteId">
          <td>{{ stat.websiteId }}</td>
          <td>{{ stat.chats }}</td>
          <td>{{ stat.missedChats }}</td>
        </tr>
      </tbody>
    </transition-group>
    <p v-else-if="!error && statsFetched" class="no-data">
      No statistics available.
    </p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'StatsViewer',
  data() {
    return {
      startDate: '',
      endDate: '',
      stats: [],
      error: '',
      statsFetched: false,
      loading: false,
    };
  },
  methods: {
    async fetchStats() {
      this.error = '';
      this.stats = [];
      this.statsFetched = false;
      this.loading = true;

      try {
        const params = {};
        if (this.startDate) params.startDate = this.startDate;
        if (this.endDate) params.endDate = this.endDate;

        const response = await axios.get('http://localhost:3000/api/stats', {
          params,
        });
        this.stats = response.data;
        this.statsFetched = true;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch statistics';
      } finally {
        this.loading = false;
      }
    },
    clearDates() {
      this.startDate = '';
      this.endDate = '';
    },
  },
};
</script>

<style scoped>
.stats-viewer {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 40, 60, 0.9));
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

h2 {
  color: #00ffcc;
  text-shadow: 0 0 10px rgba(0, 255, 204, 0.5);
  margin-bottom: 30px;
  font-size: 2.5rem;
  text-transform: uppercase;
}

.stats-form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-bottom: 30px;
}

.form-group {
  position: relative;
  flex: 1 1 200px;
}

label {
  color: #00ffcc;
  font-size: 0.9rem;
  position: absolute;
  top: -20px;
  left: 10px;
  text-shadow: 0 0 5px rgba(0, 255, 204, 0.5);
}

.futuristic-input {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.futuristic-input:focus {
  outline: none;
  border-color: #00ffcc;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  transform: scale(1.02);
}

.button-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.futuristic-button {
  padding: 12px 30px;
  background: linear-gradient(45deg, #00ffcc, #ff00cc);
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
}

.futuristic-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
  background: linear-gradient(45deg, #ff00cc, #00ffcc);
}

.clear-button {
  background: linear-gradient(45deg, #ff0066, #ff00cc);
}

.clear-button:hover {
  background: linear-gradient(45deg, #ff00cc, #ff0066);
}

.loading-spinner {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 255, 255, 0.3);
  border-top: 4px solid #00ffcc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  color: #ff0066;
  text-shadow: 0 0 5px rgba(255, 0, 102, 0.5);
  margin: 20px 0;
  font-size: 1.1rem;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
}

th,
td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  color: #fff;
}

th {
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 204, 0.2));
  color: #00ffcc;
  text-transform: uppercase;
  font-weight: bold;
}

tr:hover {
  background: rgba(0, 255, 255, 0.1);
  transform: scale(1.01);
  transition: all 0.2s ease;
}

.no-data {
  color: #00ffcc;
  text-shadow: 0 0 5px rgba(0, 255, 204, 0.5);
  margin-top: 20px;
  font-size: 1.2rem;
}

/* Vue transition for table rows */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>