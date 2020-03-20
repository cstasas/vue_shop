<template>
  <el-container class="home_container">
      <!-- 头部区域 -->
      <el-header>
        <div>
          <img src="../assets/heima.png" alt="">
          <span>电商管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!-- 主体部分 -->
      <el-container>
        <!-- 左侧边栏 -->
        <el-aside :width="isToggle ? '64px' : '200px'">
          <!-- 折叠栏 -->
          <div class="toggleFold" @click="toggleFold">|||</div>
          <!-- 侧边导航栏 -->
          <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened :collapse="isToggle" :collapse-transition="false" router :default-active="activePath">
            <!-- 一级菜单 -->
            <el-submenu :index="item.id + ''" :key="item.id" v-for="item in menuList">
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconObj[item.id]"></i>
                <!-- 文字 -->
                <span>{{item.authName}}</span>
              </template>

                <!-- 二级菜单 -->
                <el-menu-item :index="'/' + subItem.path" :key="subItem.id" v-for="subItem in item.children" @click="saveNavState('/' + subItem.path)">
                  <template slot="title">
                    <!-- 图标 -->
                    <i class="el-icon-menu"></i>
                    <!-- 文字 -->
                    <span>{{subItem.authName}}</span>
                  </template>
                </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧内容 -->
        <el-main>
          <!-- 路由占位符 -->
          <router-view></router-view>
        </el-main>
      </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 侧面导航栏数据
      menuList: [],
      iconObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 按钮切换
      isToggle: false,
      // 按钮选中
      activePath: ''
    }
  },

  // created:在模板渲染成html前调用，即通常初始化某些属性值，然后再渲染成视图
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },

  methods: {
    // 页面退出功能
    logout() {
      // 清除 token
      window.sessionStorage.clear()
      // 跳转到登录页
      this.$router.push('/login')
    },
    // 发送接收数据库请求,获取所有菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      // console.log(this.menuList)
    },
    // 切换按钮
    toggleFold() {
      this.isToggle = !this.isToggle
    },
    // 按钮选中状态功能
    saveNavState(active) {
      window.sessionStorage.setItem('activePath', active)
      this.activePath = active
    }
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  font-size: 20px;
  color: #fff;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 20px;
}

.toggleFold {
  background-color: #4a5064;
  color: #fff;
  text-align: center;
  font-size: 10px;
  line-height: 24px;
  letter-spacing: 0.4em;
  cursor: pointer;
}
</style>
