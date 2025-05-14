import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import StatsViewer from './StatsViewer.vue';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('StatsViewer', () => {
  let wrapper;
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    wrapper = mount(StatsViewer, {
      global: {
        stubs: ['transition-group'], // Stub transition-group for simpler testing
      },
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    mock.reset();
    wrapper.unmount();
    vi.useRealTimers();
  });

  it('should fetch and display stats without date filters', async () => {
    const mockResponse = [
      { websiteId: '4f8b36d00000000000000001', chats: 250, missedChats: 15 },
      { websiteId: '4f8b36d00000000000000002', chats: 50, missedChats: 2 },
    ];
    mock.onGet('http://localhost:3000/api/stats').reply(200, mockResponse);

    await wrapper.vm.fetchStats();
    await flushPromises(); // Wait for all promises to resolve
    await wrapper.vm.$nextTick(); // Wait for DOM updates

    expect(wrapper.vm.stats).toEqual(mockResponse);
    expect(wrapper.vm.statsFetched).toBe(true);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe('');
    expect(wrapper.find('table.stats-table').exists()).toBe(false);
    expect(wrapper.findAll('tbody tr').length).toBe(2);
  });

  it('should fetch stats with date filters', async () => {
    const mockResponse = [
      { websiteId: '4f8b36d00000000000000001', chats: 100, missedChats: 5 },
    ];
    mock
      .onGet('http://localhost:3000/api/stats', {
        params: { startDate: '2019-04-05', endDate: '2019-04-05' },
      })
      .reply(200, mockResponse);

    wrapper.vm.startDate = '2019-04-05';
    wrapper.vm.endDate = '2019-04-05';
    await wrapper.vm.fetchStats();
    await flushPromises(); // Wait for all promises to resolve
    await wrapper.vm.$nextTick(); // Wait for DOM updates

    expect(wrapper.vm.stats).toEqual(mockResponse);
    expect(wrapper.vm.statsFetched).toBe(true);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.find('table.stats-table').exists()).toBe(false);
    expect(wrapper.findAll('tbody tr').length).toBe(1);
  });

  it('should handle API error', async () => {
    mock.onGet('http://localhost:3000/api/stats').reply(500, { error: 'Server error' });

    await wrapper.vm.fetchStats();
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.stats).toEqual([]);
    expect(wrapper.vm.statsFetched).toBe(false);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe('Server error');
    expect(wrapper.find('.error').text()).toBe('Server error');
    expect(wrapper.find('table.stats-table').exists()).toBe(false);
  });

  it('should show no data message when stats are empty', async () => {
    mock.onGet('http://localhost:3000/api/stats').reply(200, []);

    await wrapper.vm.fetchStats();
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.stats).toEqual([]);
    expect(wrapper.vm.statsFetched).toBe(true);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.find('.no-data').text()).toBe('No statistics available.');
    expect(wrapper.find('table.stats-table').exists()).toBe(false);
  });

  it('should set loading state during fetch', async () => {
    mock.onGet('http://localhost:3000/api/stats').reply(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve([200, []]), 100);
      });
    });

    const fetchPromise = wrapper.vm.fetchStats();
    await wrapper.vm.$nextTick(); // Ensure DOM reflects loading state
    expect(wrapper.vm.loading).toBe(true);
    expect(wrapper.find('.loading-spinner').exists()).toBe(true);

    vi.advanceTimersByTime(100); // Advance timers to resolve the Promise
    await fetchPromise;
    await flushPromises();
    await wrapper.vm.$nextTick(); // Wait for DOM updates
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.find('.loading-spinner').exists()).toBe(false);
  });

  it('should clear start and end dates', async () => {
    wrapper.vm.startDate = '2019-04-05';
    wrapper.vm.endDate = '2019-04-06';
    await wrapper.vm.$nextTick();

    const clearButton = wrapper.find('.clear-button');
    await clearButton.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.startDate).toBe('');
    expect(wrapper.vm.endDate).toBe('');
    expect(wrapper.find('#startDate').element.value).toBe('');
    expect(wrapper.find('#endDate').element.value).toBe('');
  });
});