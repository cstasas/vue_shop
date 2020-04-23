<template>
  <div>
    <!-- 面包屑列表 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 顶部提示 -->
      <el-alert title="注意: 只允许为第三级分类设置相关参数!" type="warning" show-icon :closable="false"></el-alert>
      <!-- 商品分类区域 -->
      <el-row class="shop_row">
        <el-col>
          <span>选择商品分类: </span>
          <!-- 级联选择器 -->
          <el-cascader v-model="selectedKeys" :options="cateList" :props="cateListProps" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- Tab标签区域 -->
      <el-tabs v-model="activeName" @tab-click="handTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addParamsDialogVisible=true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyParamsData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 动态生成的tag标签 -->
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClosed(index,scope.row)"> {{item}}</el-tag>
                <!-- 动态编辑添加标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="editParamsDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addParamsDialogVisible=true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyParamsData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 静态生成的tag标签 -->
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClosed(index,scope.row)"> {{item}}</el-tag>
                <!-- 静态属性添加标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="editParamsDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数属性对话框区域 -->
    <el-dialog :title="'添加' + paramsText" :visible.sync="addParamsDialogVisible" width="50%" @close="addParamsClosed">
      <!-- 添加表单属性 -->
      <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef" label-width="100px">
        <el-form-item label="参数名称" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑参数属性对话框区域 -->
    <el-dialog :title="'添加' + paramsText" :visible.sync="editParamsDialogVisible" width="50%" @close="editParamsClosed">
      <!-- 添加表单属性 -->
      <el-form :model="editParamsForm" :rules="editParamsFormRules" ref="editParamsFormRef" label-width="100px">
        <el-form-item label="参数名称" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据列表
      cateList: [],
      // 级联选择框双向绑定的数组
      selectedKeys: [],
      // 级联选择器的配置对象
      cateListProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // Tab标签双向数据绑定
      activeName: 'many',
      // 动态参数数据
      manyParamsData: [],
      // 静态属性数据
      onlyParamsData: [],
      // 控制添加参数属性显示与隐藏
      addParamsDialogVisible: false,
      // 添加表单属性对象
      addParamsForm: {
        attr_name: ''
      },
      // 验证用户输入表单验证规则
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制编辑参数的显示与隐藏
      editParamsDialogVisible: false,
      // 编辑表单属性对象
      editParamsForm: {},
      // 验证用户输入表单验证规则
      editParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('商品分类列表获取失败!')
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 监听级联选择器改变事件
    handleChange() {
      this.getParamsList()
    },
    // 切换Tab标签是触发事件
    handTabClick() {
      // console.log(this.activeName)
      this.getParamsList()
    },
    // 获取查询列表参数
    async getParamsList() {
      // console.log(this.selectedKeys)
      // 如果数组长度不等于3,则说明没有选到第三级
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyParamsData = []
        this.onlyParamsData = []
        return
      }
      // 发送查询参数列表的请求
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败!')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      // 判断获取到的是动态参数还是静态属性
      if (this.activeName === 'many') {
        this.manyParamsData = res.data
        // console.log(this.manyParamsData)
      } else {
        this.onlyParamsData = res.data
        // console.log(this.onlyParamsData)
      }
    },
    // 监听添加参数属性对话框关闭事件
    addParamsClosed() {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 添加参数属性
    addParams() {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addParamsForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) return this.$message.error('添加参数属性失败!')
        this.$message.success('成功添加了参数属性!')
        this.getParamsList()
        this.addParamsDialogVisible = false
      })
    },
    // 监听编辑参数对话框关闭事件
    editParamsClosed() {
      this.$refs.editParamsFormRef.resetFields()
    },
    async editParamsDialog(editId) {
      this.editParamsDialogVisible = true
      // 根据ID查询要修改的数据
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${editId}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('动态参数属性查询失败!')
      this.editParamsForm = res.data
    },
    // 编辑参数
    editParams() {
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`, { attr_name: this.editParamsForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) return this.$message.error('动态参数属性修改失败!')
        this.$message.success('动态参数属性修改成功!')
        this.getParamsList()
        this.editParamsDialogVisible = false
      })
    },
    // 删除参数
    async removeParams(removeId) {
      const resultConfirm = await this.$confirm('此操作将永久删除该分类属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(resultConfirm)
      if (resultConfirm !== 'confirm') return this.$message.info('你当前已经取消了删除!')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${removeId}`)
      if (res.meta.status !== 200) return this.$message.error('当前分类属性删除失败!')
      this.$message.success('成功删除分类属性!')
      this.getParamsList()
    },
    // tag标签鼠标离开触发事件
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return说明输入正确,进行后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 将添加的标签保存到数据库中
      this.saveTagInputParams(row)
    },
    // 封装标签改变的请求
    async saveTagInputParams(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('编辑参数提交失败!')
      this.$message.success('编辑参数提交成功!')
    },
    // 鼠标点击添加新的标签
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick方法的作用,当页面的元素重新渲染了之后,才会执行回调函数的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 点击tag标签删除并更新数据
    handleClosed(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveTagInputParams(row)
    }
  },
  // 计算属性
  computed: {
    // 如果按钮需要被禁用,则返回true,否则为false
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的ID
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 判断当前是添加动态参数还是静态属性
    paramsText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.shop_row {
  margin: 15px 0;
}
.el-tag {
  margin: 0 15px;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
