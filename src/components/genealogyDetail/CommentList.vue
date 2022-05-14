<template>
    <ul class="commentListBox">
        <li v-for="(item,index) in commentList" :key="'comment'+index">
            <img class="cover" :src="item.createUserAvatar ? item.createUserAvatar : require('../../assets/nav/avatar.svg')" alt="头像" />
            <p>{{item.createUserName || '匿名'}}</p>
            <div class="listWrap">
                <div class="label">
                    <span>{{item.createTime}}</span>
                    <div class="zan">
                        <img :src="item.ifSupport ? require('../../assets/gdetail/zanActive.svg') : require('../../assets/gdetail/zan.svg')" alt="赞" @click="clickZan(item._key)">
                        <span>({{item.supportCount}})</span>
                        <a class="pc_hide" v-if="userId != item.createUserId" href="#commentText" @click="replyComment(item)">回复</a>
                        <span class="marginLeft10" v-if="userId == item.createUserId" @click="deleteComment(item._key)">删除</span>
                    </div>
                </div>
                <span class="content">{{item.content || ''}}</span>
                <div v-for="(item2,index2) in item.parentComment" :key="'parentComment'+index2" class="question">
                    回复
                    <span>{{item2.createUserName || '匿名'}}:</span>
                    {{item2.content || ''}}
                </div>
            </div>
        </li>
    </ul>
</template>

<script>
import api from "../../api.js";
export default {
    name: "commentList",
    components: {
        
    },
    props:{
        commentList:{
            type:[Array],
            default:[]
        },
    },
    data: () => {
        return {
            userId:'',
        };
    },
    mounted:function(){
        this.userId=window.localStorage.getItem('userId') || '';
    },
    methods:{
        clickZan: async function(id){
            if(!this.userId){alert('请先登录');return false;}
            let data=await api.patchAxios('comment',{'userKey':this.userId,'commentId':id});
            if(data.status == 200){
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
        replyComment(id){
            this.$emit('reply-comment',id);
        },
        deleteComment(id){
            this.$emit('delete-comment',id);
        },
    },
};
</script>
<style scoped lang="scss">
.commentListBox{
    display: block;
    li{
        padding: 15px 0 15px 100px;
        border-top: 1px solid #ddd;
        overflow: hidden;
        font-size: 14px;
        p{
            font-size: 16px;
            color: #5082cc;
            margin-bottom: 10px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
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
            width: 100%;
            order:5;
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
.listWrap{
    display: flex;
    flex-wrap: wrap;
    .content{
        width: 100%;
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
.marginLeft10{
    margin-left: 10px;
    cursor: pointer;
}
@media screen and (max-width: 768px) {
    .commentListBox{
        li{
            padding-left: 50px;
            p{
                margin-bottom: 0;
                font-size: 14px;
            }
            .label{
                order:0;
                margin-top: 0;
                margin-bottom: 5px;
            }
        }
    }
    .cover{
        width: 40px;
        height: 40px;
        margin-left: -50px;
    }
    // .pc_hide{
    //     display: none;
    // }
    .zan{
        display: flex;
        align-items: flex-end;
    }
}
</style>

