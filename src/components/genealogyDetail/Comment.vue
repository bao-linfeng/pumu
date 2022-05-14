<template>
    <div class="comment">
        <div class="CommentBox pc_hide">
            <div class="title">
                <img src='../../assets/home/left.svg' alt="左图标" />
                <span>评论</span>
                <i>共有{{total}}条评论</i>
            </div>
            <div class="main">
                <img class="cover" :src="avatar" alt="头像" />
                <textarea v-model="comment" @keyup="commentKeyUp" placeholder="评论" id="commentText" maxlength="140"></textarea>
                <div class="sidebar">
                    <span>{{140-comment.length}}</span>
                    <a @click="addComment"><i></i>评论</a>
                </div>
            </div>
        </div>
        <!-- <div class="choiceBox">
            <div class="title">
                <img src='../../assets/home/left.svg' alt="左图标" />
                <span>精选评论</span>
            </div>
            <CommentList v-if="commentList" :commentList="commentList" v-on:reply-comment="replyComment" v-on:delete-comment="deleteComment" />
        </div> -->
        <div class="choiceBox">
            <div class="title">
                <img src='../../assets/home/left.svg' alt="左图标" />
                <span>最新评论</span>
            </div>
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
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import PageTurn from "../genealogySearch/PageTurn.vue";
import CommentList from "./CommentList.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "comment",
    components: {
        PageTurn,
        CommentList,
    },
    props:{
        gid:{
            type:[String]
        },
    },
    data: () => {
        return {
            comment:'',
            commentList:'',
            choiceList:'',
            commentId:'',
            page:1,
            total:0,
            pages:0,
            token:'',
            userId:'',
            createUserId:'',
            avatar:'',
        };
    },
    mounted:function(){
        this.token=window.localStorage.getItem('token') || '';
        this.userId=window.localStorage.getItem('userId') || '';
        this.avatar = window.localStorage.getItem('profile') ? JSON.parse(window.localStorage.getItem('profile')).avatar : require('../../assets/nav/avatar.svg');
        
        this.getCommentHotList(this.gid);
        this.getCommentList(true,this.gid);
    },
    methods:{
        addComment: async function(){
            if(!this.comment){this.$message({message: '评论不能为空',type: 'warning'});;return false;}
            if(!this.token){this.$message({message: '请先登录在评论',type: 'warning'});;return false;} 
            if(this.createUserId == this.userId){this.$message({message: '不能评论自己',type: 'warning'});;return false;} 
            
            let data=await api.postAxios('comment',{'userKey':this.userId,'catalogKey':this.gid,'commentDetail':this.comment,'commentId':this.commentId});
            if(data.status == 200){
                this.comment='';
                this.commentId='';
                this.createUserId = ''
                this.getCommentList(true,this.gid);
            }else{
                this.$message({message: '评论失败，请重新评论',type: 'warning'});
            }
        },
        replyComment(item){
            this.commentId=item._key;
            this.createUserId = item.createUserId;
        },
        deleteComment: async function(id){
            let data=await api.deleteAxios('comment',{'commentId':id,'userKey':this.userId});
            if(data.status == 200){
                this.$message({message: '评论删除成功',type: 'success'});
                this.getCommentHotList(this.gid);
                this.getCommentList(true,this.gid);
            }else{
                this.$message({message: data.msg,type: 'warning'});
            }
        },
        commentKeyUp(e){
            if(e.keyCode == 13){
                this.addComment();
            }
        },
        getCommentHotList: async function(gid){
            // let data=await api.getAxios('pkCatalog/commentHotList?catalogKey='+gid+'&userKey='+this.token);
            // if(data.statusCode == 200){
            //     (data.data).map((item)=>{
            //         item.createTime=ADS.timeago(item.createTime)
            //     });
            //     this.commentList=data.data
            // }
        },
        getCommentList: async function(flag,gid){
            this.choiceList = '';
            let data=await api.getAxios('comment?catalogKey='+gid+'&page='+this.page+'&limit=10&userKey='+this.userId);
            if(data.status == 200){
                (data.result.list).map((item)=>{
                    item.createTime=ADS.timeago(item.createTime)
                });
                this.choiceList=data.result.list;
                if(flag){
                    this.total=data.result.total;
                    this.pages=data.result.pageNum;
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
.title{
    padding: 20px 0;
    height: 24px;
    line-height: 24px;
    font-size: 20px;
    display: flex;
    img{
        height: 24px;
        margin-right: 10px;
    }
    span{
        height: 24px;
        line-height: 24px;
        display: inline-block;
    }
    i{
        font-size: 18px;
        color: #999;
        margin-left:20px; 
        font-style: normal;
    }
}
.cover{
    width: 82px;
    height: 82px;
    display: block;
    border-radius: 50%;
    float: left;
    margin-left: -100px;
}
.comment{
    width: 100%;
    min-height: 544px;
    font-size: 16px;
    box-sizing: border-box;
    background: #fff;
    color: #666;
    padding: 10px 30px;
}
.CommentBox{
    .main{
        padding: 15px 0 15px 100px;
        overflow: hidden;
        textarea{
            box-sizing: border-box;
            width: 100%;
            height: 100px;
            background: #F4F7F9;
            border: 1px solid #E5E5E5;
            border-radius: 8px;
            padding: 10px;
            outline: none;
        }
        .sidebar{
            text-align: right;
            padding: 15px 0;
            span{
                font-size: 18px;
                color: #999;
            }
            a{
                margin-left: 20px;
                display: inline-block;
                width:88px;
                height: 36px;
                line-height: 36px;
                border-radius: 3px;
                text-align: center;
                background: #5082cc;
                color: #fff;
                font-size: 14px;
                cursor: pointer;
                i{
                    display: inline-block;
                    width:12px;
                    height: 12px;
                    background: url('../../assets/gdetail/Cedit.png') no-repeat 0 0;
                    margin-right: 5px;
                }
                &:hover{
                    i{
                        background-position-x:-12px; 
                    }
                }
            }
        }
    }
}
.choiceBox{
    position: relative;
    width: 100%;
    padding-bottom: 80px;
    margin-bottom: 20px;
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
    .pc_hide{
        display: none;
    }
    .comment{
        min-height: 400px;
        padding: 10px;
    }
    .choiceBox{
        padding-bottom: 30px;
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
    }
    .xs_inputGroupWrap{
        padding: 15px 10px;
        background: #fff;
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

