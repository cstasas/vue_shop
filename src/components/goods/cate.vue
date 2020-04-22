<template>
  <div>
    <!-- 面包屑列表 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showCateDialogVisible">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table class="treeTable" :data="cateList" :columns="columns" show-index index-text="#" :show-row-hover="false" :selection-type="false" border :expand-type="false">
        <!-- 是否有效 -->
        <template slot="isOK" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: #409EFF"></i>
          <i class="el-icon-error" v-else style="color: #F56C6C"></i>
        </template>
        <!-- 排序 -->
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="danger" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCateList(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCateList(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="userInfo.pagenum"
        :page-sizes="[3, 5, 15, 20]"
        :page-size="userInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类窗口对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%" @close="addCateDialogClose">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps"
          @change="parentCateChange" clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%">
      <!-- 编辑分类的表单 -->
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate(editCateForm.cat_id)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表数据
      cateList: [],
      // 请求参数
      userInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      // 表格各列的配置
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        type: 'template',
        template: 'isOK'
      }, {
        label: '排序',
        type: 'template',
        template: 'sort'
      }, {
        label: '操作',
        type: 'template',
        template: 'opt'
      }],
      // 控制添加分类显示与隐藏
      addCateDialogVisible: false,
      // 添加分类表单数据对象
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      // 添加分类表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 添加分类列表数据
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 控制编辑分类显示与隐藏
      editCateDialogVisible: false,
      // 编辑分类表单数据
      editCateForm: {
        cat_id: 0,
        cat_name: ''
      },
      // 编辑分类表单验证规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 加载商品分类列表数据
    this.getCateList()
  },
  methods: {
    // 获取商品列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.userInfo })
      if (res.meta.status !== 200) return this.$message.error('商品列表数据获取失败!')
      // console.log(res.data)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听当前 pagesize 的改变
    handleSizeChange(newSize) {
      this.userInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听当前 pagenum 的改变
    handleCurrentChange(newNum) {
      this.userInfo.pagenum = newNum
      this.getCateList()
    },
    // 鼠标点击显示添加分类对话框
    showCateDialogVisible() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取添加分类对话框的前两层数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败!')
      // console.log(res.data)
      this.parentCateList = res.data
      // console.log(this.parentCateList)
    },
    // 选择项发生变化触发这个函数
    parentCateChange() {
      console.log(this.selectedKeys)
      // 如果 this.selectedKeys.length 数组长度大于0,说明被选中了,反之则没有
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类事件函数
    addCate() {
      // console.log(this.addCateForm)
      // 预解析
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        // 发送添加数据请求
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('商品分类添加失败!')
        this.$message.success('商品分类添加成功!')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听添加分类表单关闭事件
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.parentCateList.cat_pid = 0
      this.parentCateList.cat_level = 0
    },
    // 打开编辑分类窗口
    async editCateList(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('商品分类查询失败!')
      this.editCateForm.cat_id = res.data.cat_id
      this.editCateForm.cat_name = res.data.cat_name
      this.editCateDialogVisible = true
    },
    // 编辑分类
    editCate(id) {
      // console.log(id)
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + id, { cat_name: this.editCateForm.cat_name })
        if (res.meta.status !== 200) return this.$message.error('商品编辑分类修改失败!')
        this.$message.success('商品分类编辑成功!')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 删除分类
    async deleteCateList(id) {
      // console.log(id)
      const cateConfirm = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (cateConfirm !== 'confirm') return this.$message.info('删除商品分类失败!')
      // 发送删除分类请求
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除商品分类失败!')
      this.$message.success('商品分类删除成功!')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
