<template>
  <div>
    <!-- 面包屑列表 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部提示 -->
      <el-alert title="添加商品信息" type="info" show-icon :closable="false" center></el-alert>
      <!-- 步骤条 -->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs标签页 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabsLeave" @tab-click="tabToggleClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器  -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateListProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyListData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyListData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 图片上传 -->
            <el-upload :action="imgActionURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headersObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBtn" @click="addFromGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览区域 -->
    <el-dialog
      title="图片预览"
      :visible.sync="dialogImgVisible"
      width="50%">
      <img :src="imgURL" alt="" class="PreviewImg">
    </el-dialog>
  </div>
</template>

<script>
// 引入深拷贝组件
import _ from 'lodash'

export default {
  data() {
    return {
      // 步骤条的索引
      activeIndex: '0',
      // 添加商品数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选择器选项改变绑定数据
        goods_cat: [],
        // 图片上传的临时路径
        pics: [],
        // 副文本内容
        goods_introduce: '',
        // 商品的参数(包含动态参数和静态属性)
        attrs: []
      },
      // 商品数据验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表数据
      cateList: [],
      // 级联选择器属性设置
      cateListProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 商品动态数据
      manyListData: [],
      // 商品静态数据
      onlyListData: [],
      // 图片上传的URL地址
      imgActionURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 设置图片上传的请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 控制图片预览的显示和隐藏
      dialogImgVisible: false,
      // 图片预览URL地址
      imgURL: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品列表数据失败!')
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 监听级联选择器改变事件
    handleChange() {
      // console.log(this.addForm.goods_cat)
      // 判断只能选择第三类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 监听tabs切换事件
    beforeTabsLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择好商品分类!')
        return false
      }
    },
    // tabs标签点击时触发
    async tabToggleClick() {
      // console.log(this.cateId)
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error('获取商品动态参数列表失败!')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(' ') : []
        })
        this.manyListData = res.data
        // console.log(this.manyListData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error('获取商品静态属性失败!')
        this.onlyListData = res.data
        // console.log(this.onlyListData)
      }
    },
    // 点击预览图片触发的事件
    handlePreview(file) {
      console.log(file)
      this.imgURL = file.response.data.url
      this.dialogImgVisible = true
    },
    // 点击删除图片触发的事件
    handleRemove(file) {
      // console.log(file)
      // 找到需要删除的对象
      const filePath = file.response.data.tmp_path
      // 查找对象索引
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 根据索引删除数组对应的数据
      this.addForm.pics.splice(i, 1)
      // console.log(this.addForm.pics)
    },
    // 图片成功上传时触发的事件
    handleSuccess(response) {
      // console.log(response)
      const picsObj = { pic: response.data.tmp_path }
      this.addForm.pics.push(picsObj)
      // console.log(this.addForm.pics)
    },
    // 添加商品事件
    addFromGoods() {
      // console.log(this.addForm)
      // 提交表单之前的预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整的表单在提交!')
        // 执行添加商品的业务逻辑
        // 深拷贝addForm对象
        const form = _.cloneDeep(this.addForm)
        // 将数组转换为字符串
        // this.addForm.goods_cat = this.addForm.goods_cat.join(',')
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyListData.forEach(item => {
          const newObj = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          // 将新增加的对象添加到数组中
          this.addForm.attrs.push(newObj)
        })
        // 处理静态属性
        this.onlyListData.forEach(item => {
          const newObj = { attr_id: item.attr_id, attr_value: item.attr_vals }
          // 将新增加的对象添加到数组中
          this.addForm.attrs.push(newObj)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        // 发送添加商品的请求
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('当前添加商品失败!')
        this.$message.success('当前商品添加成功!')
        this.$router.push('/goods')
      })
    }
  },
  // 计算属性
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.PreviewImg {
  width: 100%;
}
.addBtn {
  margin-top: 15px;
}
</style>
