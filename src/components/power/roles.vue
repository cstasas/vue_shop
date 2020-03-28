<template>
  <div>
    <!-- 面包屑列表 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="rolesDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表展示区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-row :class="['rowbottom', i1 === 0 ? 'rowtop' : '', 'vcenter']" :key="item1.id" v-for="(item1, i1) in scope.row.children">
              <!-- 渲染一级权限 -->
              <el-col :span="6">
                <el-tag closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="18">
                <el-row :class="['rowbottom', i2 === 0 ? 'rowtop' : '', 'vcenter']" :key="item2.id" v-for="(item2, i2) in item1.children">
                  <el-col :span="6">
                    <el-tag type="success" closable>{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag :class="['rowbottom', i3 === 0 ? 'rowtop' : '']" :key="item3.id" v-for="(item3, i3) in item2.children" type="danger" closable @close="removeRolesTag(scope.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 角色索引 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRolesList(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRolesList(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showRolesRights(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色界面区域 -->
      <el-dialog title="添加角色" :visible.sync="rolesDialogVisible" width="50%" @close="addRolesClose">
        <!-- 主体内容 -->
        <el-form :model="addRolesForm" :rules="addRolesRules" ref="addRolesRef" label-width="70px">
          <el-form-item label="名称" prop="roleName">
            <el-input v-model="addRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="roleDesc">
            <el-input v-model="addRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮区域 -->
        <span slot="footer">
          <el-button @click="rolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色界面区域 -->
      <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editRolesClose">
        <!-- 主体内容 -->
        <el-form :model="editRolesForm" :rules="editRolesRules" ref="editRolesRef" label-width="70px">
          <el-form-item label="名称" prop="roleName">
            <el-input v-model="editRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="roleDesc">
            <el-input v-model="editRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮区域 -->
        <span slot="footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoles(editRolesForm.roleId)">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限界面区域 -->
      <el-dialog title="分配权限" :visible.sync="showRightsVisible" width="50%" @close="removeRolesClose">
        <!-- 树形控件 -->
        <el-tree :data="showRolesList" show-checkbox node-key="id" :props="showProps" default-expand-all :default-checked-keys="defaultKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showRightsVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRightsRoles">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  // 预先加载
  created() {
    this.getRolesList()
  },
  data() {
    const checkName = (rules, value, callback) => {
      const regName = /^[\u4e00-\u9fa5]{0,}$/
      if (regName.test(value)) {
        return callback()
      }
      callback(new Error('请输入汉字!'))
    }
    return {
      rolesList: [],
      // 控制添加角色区域隐藏显示
      rolesDialogVisible: false,
      // 添加用户的表单数据
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加用户验证规则
      addRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { validator: checkName, trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { validator: checkName, trigger: 'blur' }
        ]
      },
      // 控制修改角色区域隐藏显示
      editDialogVisible: false,
      // 用户修改的表单数据
      editRolesForm: {},
      // 用户修改的验证规则
      editRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { validator: checkName, trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { validator: checkName, trigger: 'blur' }
        ]
      },
      // 控制分配权限界面隐藏显示
      showRightsVisible: false,
      // 权限界面区域数据
      showRolesList: [],
      // 配置树形结构选项
      showProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点数组
      defaultKeys: [],
      // 当前即将分配角色权限的ID
      rolesID: []
    }
  },
  methods: {
    // 获取用户角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('用户角色列表获取失败')
      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    // 监听添加角色区域关闭事件
    addRolesClose() {
      this.$refs.addRolesRef.resetFields()
    },
    // 添加角色功能
    addRoles() {
      // 添加角色之前的预验证
      this.$refs.addRolesRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        // 发送请求
        const { data: res } = await this.$http.post('roles', this.addRolesForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('角色添加成功')
        // 关闭对话框
        this.rolesDialogVisible = false
        // 重新加载列表
        this.getRolesList()
      })
    },
    // 修改角色信息窗口
    async editRolesList(id) {
      // console.log(id)
      // 先根据ID查询用户要修改的数据
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户角色信息失败')
      this.editRolesForm = res.data
      // console.log(this.editRolesForm)
      this.editDialogVisible = true
    },
    // 监听修改角色区域关闭事件
    editRolesClose() {
      this.$refs.editRolesRef.resetFields()
    },
    // 修改角色信息
    editRoles(id) {
      // console.log(id)
      this.$refs.editRolesRef.validate(async valid => {
        if (!valid) return
        // 发送修改信息请求
        const { data: res } = await this.$http.put('roles/' + id, { roleName: this.editRolesForm.roleName, roleDesc: this.editRolesForm.roleDesc })
        if (res.meta.status !== 200) return this.$message.error('修改角色信息失败!')
        this.$message.success('角色信息修改成功!')
        this.editDialogVisible = false
        this.getRolesList()
      })
    },
    // 删除角色信息
    async removeRolesList(id) {
      // console.log(id)
      const rolesConfirm = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(rolesConfirm)
      if (rolesConfirm !== 'confirm') return this.$message.info('删除角色信息失败!')
      // 发送删除角色请求
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('当前删除角色信息失败!')
      this.$message.success('当前删除角色信息成功')
      this.getRolesList()
    },
    // 删除Tag项
    async removeRolesTag(role, rightID) {
      const resultConfirm = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(resultConfirm)
      if (resultConfirm !== 'confirm') return this.$message.info('您已经取消了删除')
      // console.log('成功删除了当前选项')
      // 发送删除请求
      // console.log(role)
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightID}`)
      // 返回的data, 是当前角色下最新的权限数据
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除角色权限失败!')
      this.$message.success('当前角色权限删除成功!')
      // 更新当前最新权限数据
      // console.log(res.data)
      role.children = res.data
    },
    // 分配权限功能
    async showRolesRights(role) {
      // 查询所有权限列表
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('所有权限列表获取失败!')
      this.showRolesList = res.data
      // console.log(this.showRolesList)

      this.rolesID = role.id

      // 递归获取三级权限的ID
      this.getleafKeys(role, this.defaultKeys)

      this.showRightsVisible = true
    },
    // 通过递归的形式 获取三级权限下的ID
    getleafKeys(node, arr) {
      // 判断node里面没有children属性则表示找到了
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getleafKeys(item, arr))
    },
    // 监听权限界面关闭清空节点数组
    removeRolesClose() {
      this.defaultKeys = []
    },
    // 点击为角色分配权限
    async allotRightsRoles() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      const idStr = keys.join(',')
      // console.log(idStr)
      // 发送请求
      const { data: res } = await this.$http.post(`roles/${this.rolesID}/rights`, { rids: idStr })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('分配权限失败!')
      this.$message.success('您当前分配权限成功!')
      // 重新加载数据
      this.getRolesList()
      // 关闭对话框
      this.showRightsVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 8px;
}
.rowtop {
  border-top: 1px solid #eee;
}
.rowbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
