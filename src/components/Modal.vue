<template>
  <div class="modal-bg" v-show="show" @click="hideModal">
    <div class="modal-container" @click.stop="">
      <div class="modal-header">
        {{ title }}
      </div>
      <div class="modal-main">
        <slot></slot>
      </div>
      <div class="modal-footer">
        <!--        <button @click="hideModal">取消</button>-->
        <!--        <button @click.stop="submit">保存</button>-->
        <v-btn
            color="green darken-1"
            text
            @click.stop="submit"
        >
          保存
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "modal",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
  },
  methods: {
    hideModal() {
      this.$emit('hideModal')
    },

    submit() {
      this.$emit('submit')
    },
  }
}
</script>

<style scoped>
.modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, .5);
  z-index: 10009;
}

.modal-container {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.modal-header {
  height: 56px;
  /*background: #409EFF;*/
  background-color: #475B65;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 57px;
  /*border-top: 1px solid #ddd;*/
}

.modal-footer button {
  width: 100px;
}

.modal-main {
  padding: 15px 40px;
}
</style>