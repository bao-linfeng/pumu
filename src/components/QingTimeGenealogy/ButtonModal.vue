<template>
    <div class="button-modal-wrap">
        <button @click="handleClick('buy')"><img src="../../assets/icon/buy.svg" alt="购买家谱" /> 购买家谱</button>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "buttonModal",
    props:{
        fieldFilters:{
            type: Array,
        }
    },
    components: {
        
    },
    data: () => {
        return {
            
        };
    },
    created:function(){
        
    },
    mounted:function(){
        
    },
    methods:{
        handleClick(type){
            this.$emit('open-payment-modal',type);
        },
    },
    computed: {
        ...mapState({
            stationName: state => state.nav.stationName,
            stationlogo: state => state.nav.stationlogo,
        })
    },
    watch:{
        
    }
};
</script>

<style scoped lang="scss">
.button-modal-wrap{
    position: relative;
    margin: 20px;
    width: calc(100% - 40px);
    display: flex;
    align-items: center;
    button{
        width: 140px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        color: #333;
        background: #fff;
        border: none;
        outline: none;
        border-radius: 20px;
        cursor: pointer;
        margin-right: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        img{
            margin-right: 5px;
        }
    }
}
</style>

