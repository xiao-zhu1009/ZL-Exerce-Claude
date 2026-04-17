<template>
  <div>
    <el-tabs v-model="activeTab" type="border-card" @tab-click="onTabClick">
      <el-tab-pane label="课程列表" name="courses" lazy>
        <course-list ref="courseList" @reservations-changed="updateReservationCount" />
      </el-tab-pane>
      <el-tab-pane :label="reservationTabLabel" name="mine" lazy>
        <my-reservations ref="myReservations" @reservations-changed="updateReservationCount" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import CourseList from './CourseList.vue'
import MyReservations from './MyReservations.vue'

export default {
  name: 'Course',
  components: {
    CourseList,
    MyReservations,
  },
  data() {
    return {
      activeTab: 'courses',
    }
  },
  computed: {
    reservationCount() { return this.$store.state.reservationCount },
    reservationTabLabel() {
      return this.reservationCount > 0 ? `我的预约(${this.reservationCount})` : '我的预约'
    }
  },
  methods: {
    onTabClick(tab) {
      if (tab.name === 'mine' && this.$refs.myReservations && this.$refs.myReservations.fetchReservations) {
        this.$refs.myReservations.fetchReservations()
      }
      if (tab.name === 'courses' && this.$refs.courseList && this.$refs.courseList.fetchReservedSet) {
        this.$refs.courseList.fetchReservedSet()
      }
    },
    updateReservationCount(count) {
      this.$store.commit('SET_RESERVATION_COUNT', count)
    },
  }
}
</script>
