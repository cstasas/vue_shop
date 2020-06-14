<template>
  <div>
    <!-- 面包屑列表 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 顶部搜索框 -->
      <el-row>
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- table表格 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="300px"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="100px"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="100px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="100px"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160px">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editAddress"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="editExpress"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 订单编辑修改地址对话框区域 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editAddressVisible"
      width="50%">
      <el-form :model="editOrderForm" :rules="editOrderFormRules" ref="editOrderFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
            <el-cascader
              v-model="editOrderForm.address1"
              :options="cityData"
              :props="{ expandTrigger: 'hover' }"></el-cascader>
        </el-form-item>
        <el-form-item label="修改地址" prop="address2">
          <el-input v-model="editOrderForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAddressVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 显示快递物流区域 -->
    <el-dialog
      title="物流进度"
      :visible.sync="editExpressVisible"
      width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in expressData"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
// 引入城市数据
import cityData from './citydata.js'
export default {
  data() {
    return {
      // 订单数据列表
      orderList: [],
      // 请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总页数
      total: 0,
      // 控制修改地址的隐藏和显示
      editAddressVisible: false,
      // 需要修改的地址数据
      editOrderForm: {
        address1: [],
        address2: ''
      },
      // 地址数据验证规则
      editOrderFormRules: {
        address1: [
          { required: true, message: '请选择地址名称', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入地址名称', trigger: 'blur' }
        ]
      },
      cityData,
      editExpressVisible: false,
      expressData: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单数据列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单数据列表失败!')
      this.orderList = res.data.goods
      this.total = res.data.total
      // console.log(this.orderList)
      // console.log(this.queryInfo)
    },
    // 监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 修改地址按钮触发事件
    editAddress() {
      this.editAddressVisible = true
    },
    // 显示物流
    async editExpress() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error('查询物流信息失败!')
      // console.log(res.data)
      this.expressData = res.data
      this.editExpressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>

</style>
