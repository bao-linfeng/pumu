<template>
    <div class="sm_comment_wrap">
        <div class="sm_comment_box style1">
            <!-- <div class="sm_comment_line" @click="hideComment"></div> -->
            <img class="commentBack" src='../../assets/gdetail/commentBack.svg' @click="hideComment" />
            <div class="sm_comment_tab">
                <span :class="{active: commentTab == index}" @click="commentToggle(index)" v-for="(item,index) in ['最新评论']" :key="'commentTab'+index">{{item}}</span>
            </div>
            <!-- <div class="choiceBox" v-show="commentTab == 0">
                <CommentList v-if="commentList" :commentList="commentList" v-on:reply-comment="replyComment" v-on:delete-comment="deleteComment" />
            </div> -->
            <div class="choiceBox" v-show="commentTab === 0">
                <CommentList v-if="choiceList" :commentList="choiceList" v-on:reply-comment="replyComment" v-on:delete-comment="deleteComment" />
                <PageTurn v-if="pages > 1" :total="total" :pages="pages" :curPage="page" :label="'条评论'" v-on:click-page="getGenealogyListForPage" />
            </div>
            <div class="xs_inputGroupWrap">
                <div class="xs_inputGroup">
                    <label for="xs_commentText">评论</label>
                    <input type="text" v-model="comment" @keyup="commentKeyUp" id="xs_commentText" maxlength="30" placeholder="请输入评论内容..." />
                    <i class="el-icon-edit" @click="addComment"></i>
                </div>
            </div>
        </div>
        <Loading v-show="loading" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import PageTurn from "../genealogySearch/PageTurn.vue";
import CommentList from "./CommentList.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "commentSM",
    components: {
        PageTurn,
        CommentList,
    },
    props:{
        gid:{
            type:String,
            required:true
        },
    },
    data: () => {
        return {
            loading:true,
            comment:'',
            commentList:'',
            choiceList:'',
            commentId:'',
            page:1,
            total:0,
            pages:0,
            token:'',
            userId:'',
            commentTab:0,
            createUserId:'',
        };
    },
    mounted:function(){
        let search=window.location.pathname,params=ADS.params(search);
        this.token=window.localStorage.getItem('token') || '';
        this.userId=window.localStorage.getItem('userId') || '';
        
        this.getCommentList(true,this.gid);
    },
    methods:{
        deleteComment: async function(id){
            let data=await api.getAxios('pkCatalog/commentRemove?commentId='+id+'&token='+this.token);
            if(data.status == 200){
                this.$message({message: '评论删除成功',type: 'success'});
                this.getCommentHotList(this.gid);
                this.getCommentList(true,this.gid);
            }
        },
        replyComment(item){
            this.commentId=item._key;
            this.createUserId = item.createUserId;
        },
        commentToggle(index){
            this.commentTab=index;
            index ? this.getCommentList(true,this.gid) : this.getCommentHotList(this.gid);
        },
        hideComment(){
            this.$emit('hide-comment',false);
        },
        addComment: async function(){
            if(!this.comment){alert('评论不能为空');return false;}
            if(!this.token){alert('请先登录在评论');return false;} 
            if(this.createUserId == this.userId){alert('不能评论自己');return false;} 
            
            let data=await api.postAxios('comment',{'userKey':this.userId,'catalogKey':this.gid,'commentDetail':this.comment,'commentId':this.commentId});
            if(data.status == 200){
                //this.getCommentHotList()
                this.comment='';
                this.commentId='';
                this.createUserId = '';
                //alert('评论成功');
                this.getCommentList(true,this.gid);
            }else{
                alert('添加评论失败');
            }
        },
        commentKeyUp(e){
            if(e.keyCode == 13){
                this.addComment();
            }
        },
        getCommentHotList: async function(gid){
            this.loading=true;
            let data=await api.getAxios('pkCatalog/commentHotList?catalogKey='+gid+'&token='+this.token);
            if(data.statusCode == 200){
                this.loading=false;
                (data.data).map((item)=>{
                    item.createTime=ADS.timeago(item.createTime)
                });
                this.commentList=data.data
            }else{
                this.loading=false;
            }
        },
        getCommentList: async function(flag,gid){
            let data=await api.getAxios('comment?catalogKey='+gid+'&page='+this.page+'&limit=10&userKey='+this.userId);
            if(data.status == 200 && data.result){
                this.loading=false;
                (data.result.list).map((item)=>{
                    item.createTime=ADS.timeago(item.createTime)
                });
                this.choiceList=data.result.list;
                if(flag){
                    this.total=data.result.total;
                    this.pages=data.result.pageNum;
                }
            }else{
                this.loading=false;
            }
        },
        clickZan: async function(id){
            if(!this.token){alert('请先登录');return false;}
            let data=await api.getAxios('pkCatalog/commentSupport?commentId='+id+'&token='+this.token);
            if(data.status == 200){
                this.choiceList.map(item=>{
                    if(item._key == id){
                        item.ifSupport=!item.ifSupport;
                        if(item.ifSupport){
                            item.supportCount=item.supportCount+1; 
                        }else{
                            item.supportCount=item.supportCount-1; 
                        }
                    }
                });
                if(this.commentList && this.commentList.length){
                    this.commentList.map(item=>{
                        if(item._key == id){
                            item.ifSupport=!item.ifSupport;
                            if(item.ifSupport){
                                item.supportCount=item.supportCount+1; 
                            }else{
                                item.supportCount=item.supportCount-1; 
                            }
                        }
                    });
                }
            }
        },
        getGenealogyListForPage(page){
            this.page=page;
            this.getCommentList(false);
        },
    },
    computed: {
        ...mapState({
            activeSurname: state => state.surname.activeSurname,
            activeSurnameIndex:state => state.surname.activeSurnameIndex,
        }),
    },
};
</script>
<style scoped lang="scss">
.sm_comment_wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    .sm_comment_box{
        position: absolute;
        background: #fff;
        top: 72px;
        right: 0;
        bottom: 0;
        left: 0;
        overflow-y: scroll;
        .sm_comment_line{
            width: 60px;
            height: 6px;
            border-radius: 3px;
            background: #ddd;
            margin: 15px auto 8px auto;
        }
        .sm_comment_tab{
            text-align: center;
            border-bottom: 1px solid #ddd;
            span{
                display: inline-block;
                width: 80px;
                height: 50px;
                line-height: 50px;
                text-align: center;
                font-size: 20px;
                color: #666;
                font-weight: bold;
                margin: 0 20px;
                &.active{
                    border-bottom: 2px solid #9D7747;
                }
            }
        }
    }
}
.choiceBox{
    position: relative;
    width: calc(100% - 20px);
    padding: 0 10px 70px 10px;
    .commentListBox{
        display: block;
        li{
            padding: 15px 0 15px 100px;
            border-top: 1px solid #ddd;
            overflow: hidden;
            font-size: 12px;
            p{
                font-size: 18px;
                color: #5082cc;
                margin-bottom: 10px;
            }
            .question{
                box-sizing: border-box;
                width: 100%;
                min-height: 50px;
                background: #F4F7F9;
                border: 1px solid #E5E5E5;
                border-radius: 3px;
                padding: 10px;
                margin-top: 5px;
                span{
                    color: #5082cc;
                }
            }
            .label{
                margin-top: 10px;
                display: flex;
                color: #999;
                height: 20px;
                line-height: 20px;
                justify-content: space-between;
                img{
                    margin-right: 5px;
                    cursor: pointer;
                }
                a{
                    color: #999;
                    margin-left: 20px;
                }
            }
        }
    }
}
.xs_inputGroupWrap{
    display: none;
}
@media screen and (max-width: 768px) {
    .choiceBox{
        .commentListBox{
            li{
                padding-left: 50px;
            }
        }
    }
    .cover{
        width: 40px;
        height: 40px;
        margin-left: -50px;
        float: left;
        border-radius: 50%;
    }
    .commentBack{
        width: 50px;
        display: block;
        margin: 10px auto;
    }
    .xs_inputGroupWrap{
        position: fixed;
        width: calc(100% - 20px);
        left: 0;
        bottom: 0;
        padding: 15px 10px;
        background: #f2f2f2;
        display: block;
        .xs_inputGroup{
            width: 100%;
            height: 38px;
            line-height: 38px;
            border-radius: 19px;
            border:1px solid #ddd;
            display: flex;
            justify-content: space-between;
            overflow: hidden;
            background: #fff;
            label{
                width: 80px;
                display: block;
                height: 38px;
                line-height: 38px;
                text-align: center;
            }
            input{
                width: 300px;
                display: block;
                height: 38px;
                line-height: 38px;
                border: none;
                outline: none;
            }
            i{
                font-size: 20px;
                margin: 9px 10px 0 0;
            }
        }
    }
}
</style>

