<template>
  <div class="stats-viewer">
    <h2>Chat Statistics</h2>
    <form @submit.prevent="fetchStats">
      <div class="form-group">
        <label for="startDate">Start Date (optional):</label>
        <input
          type="date"
          id="startDate"
          v-model="startDate"
          placeholder="YYYY-MM-DD"
        />
      </div>
      <div class="form-group">
        <label for="endDate">End Date (optional):</label>
        <input
          type="date"
          id="endDate"
          v-model="endDate"
          placeholder="YYYY-MM-DD"
        />
      </div>
      <button type="submit">Fetch Statistics</button>
    </form>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <table v-if="stats.length" class="stats-table">
      <thead>
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
    </table>
    <p v-else-if="!error && statsFetched">No statistics available.</p>
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
      statsFetched: false
    };
  },
  methods: {
    async fetchStats() {
      this.error = '';
      this.stats = [];
      this.statsFetched = false;

      try {
        const params = {};
        if (this.startDate) params.startDate = this.startDate;
        if (this.endDate) params.endDate = this.endDate;

        const response = await axios.get('http://localhost:3000/api/stats', { params });
        this.stats = response.data;
        this.statsFetched = true;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch statistics';
      }
    }
  }
};
</script>

<style scoped>
.stats-viewer {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input[type="date"] {
  padding: 8px;
  width: 200px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #3aa876;
}
.error {
  color: red;
  margin: 10px 0;
}
.stats-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}
th {
  background-color: #f4f4f4;
}
</style>