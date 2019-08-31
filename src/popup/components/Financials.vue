<template>
    <div>
        <div class="row">
            <h5 class="center-align">Financials</h5>

            <div class="col s6 center-align">
                <h6>Credit</h6>
                <span v-if="financials !== null">SUB {{ (financials.pendingCredit / 1000000000).toFixed(6) }} </span>
                <span v-if="financials === null">-</span>
            </div>

            <div class="col s6 center-align">
                <h6>Debt</h6>
                <span v-if="financials !== null">SUB {{ (financials.pendingDebt / 1000000000).toFixed(6) }} </span>
                <span v-if="financials === null">-</span>
            </div>

            <FinancialsChart class="fin-chart" v-bind:chartData="chartData" v-bind:options="options" v-if="chartData !== null"></FinancialsChart>

        </div>
    </div>
</template>

<style scoped>
    h5 {
        margin-top: 20px;
    }

    .fin-chart {
        width: 100%;
        height: 75px;
    }
</style>

<script>
import FinancialsChart from './FinancialsChart.vue';

export default {
    props: ['financials', 'financialsArray'],
    data: function() {
        return {
            chartData: null,
            options: {
                responsive: true, 
                maintainAspectRatio: false,
                legend: { display: false },
                scales: {
                    xAxes: [{
                        display: false,
                        type: 'time',
                        time: {
                            unit: 'month'
                        }
                    }],
                    yAxes: [{
                        display: false
                    }],
                },
                elements: {
                    point:{
                        radius: 0
                    }
                }
            }
        }
    },
    watch: {
        financialsArray: function(newFinancials) {
            this.chartData = {
                labels: newFinancials.map(finObj => finObj.time),
                datasets: [
                    {
                        label: 'Credit',
                        backgroundColor: 'rgba(53, 229, 57, 0.3)',
                        data: newFinancials.map(obj => obj.pendingCredit)
                    },
                    {
                        label: 'Debt',
                        backgroundColor: 'rgba(229, 57, 53, 0.3)',
                        data: newFinancials.map(obj => obj.pendingDebt)
                    }
                ]
            }
        },
    },
    components: {
        FinancialsChart
    }
}
</script>