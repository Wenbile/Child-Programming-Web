<template>
  <v-data-table
      :headers="headers"
      :items="types"
      class="elevation-0"
  >
    <template v-slot:top>
      <v-toolbar
          flat
      >
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog
            v-model="dialog"
            max-width="500px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="green"
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
            >
              新增
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
<!--                  <v-col-->
<!--                      cols="12"-->
<!--                      sm="6"-->
<!--                      md="4"-->
<!--                  >-->
<!--                    <v-text-field-->
<!--                        v-model="editedItem.id"-->
<!--                        label="ID"-->
<!--                    ></v-text-field>-->
<!--                  </v-col>-->
                  <v-col
                      cols="12"
                      sm="6"
                      md="4"
                  >
                    <v-text-field
                        v-model="editedItem.type_name"
                        label="板块名称"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                  color="blue darken-1"
                  text
                  @click="close"
              >
                Cancel
              </v-btn>
              <v-btn
                  color="blue darken-1"
                  text
                  @click="save"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">确定要删除吗?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete">取消</v-btn>
              <v-btn color="blue darken-1" text @click="deleteItemConfirm">确认</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
          small
          class="mr-2"
          @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
          small
          @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn
          color="primary"
          @click="initialize"
      >
        Reset
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: "typeEdit",
  data: () => ({
    title:"板块编辑",
    dialog: false,
    dialogDelete: false,
    headers: [
      {text:"ID",value:"id"},
      {text:"板块名称",value: "type_name"},
      { text: '操作', value: 'actions', sortable: false },
    ],
    types:[],
    editedIndex: -1,
    editedItem: {
      id:-1,
      type_name: "",
    },
    defaultItem: {
      id:-1,
      type_name: "",
    },
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? '新增' : '编辑'
    },
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },

  created () {
    this.initialize()
  },

  methods: {
    async initialize () {
      var re = await this.$request.callApi("GET",this.$robotApi.getProjectTypes)
      this.types = re.data
    },

    editItem (item) {
      this.editedIndex = this.types.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      this.editedIndex = this.types.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm () {
      console.log("delete")
      this.$request.callApi("POST",this.$robotApi.deleteProjectType,this.types[this.editedIndex])
      this.types.splice(this.editedIndex, 1)

      this.closeDelete()
    },

    close () {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async save() {

      if (this.editedIndex > -1) {
        Object.assign(this.types[this.editedIndex], this.editedItem)
      } else {
        // this.types.push(this.editedItem)
      }
      if (this.editedItem.id == -1) {
        await this.$request.callApi("POST", this.$robotApi.addProjectType, this.editedItem)
        var re = await this.$request.callApi("GET",this.$robotApi.getProjectTypes)
        this.types = re.data
      } else {
        console.log("edit")
        this.$request.callApi("POST", this.$robotApi.editProjectType, this.editedItem)
      }

      this.close()
    },
  },
}
</script>
<style scoped>

</style>