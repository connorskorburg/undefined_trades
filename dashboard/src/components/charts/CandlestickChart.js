import React, { useEffect, useState } from 'react';
import 'antd/dist/antd.css';
import { Layout, Tabs } from 'antd';
import axios from 'axios';
import Chart from 'react-apexcharts'

const { Content } = Layout;
const CandlestickChart = () => {
    const ticker = 'SPY';
    const [candlestickData, setCandlestickData] = useState([]);
    const [timeFrame, setTimeFrame] = useState('1m');
    const options = {
        chart: {
          type: 'candlestick',
          height: 500
        },
        title: {
          text: `$${ticker} Daily`,
          align: 'left'
        },
        tooltip: {
            x: {
                show: false,
            }
        },
        xaxis: {
            type: "category",
            labels: {
                formatter: (value) => {
                    if (timeFrame === '1mm' || timeFrame === '5dm') {
                        return value;
                    }
                    if (value) {
                        return `${value.split('-')[1]}-${value.split('-')[2]}`;
                    }
                    // const date = new Date(value);
                    // return date.toLocaleDateString('en-US',  { month: 'numeric', day: 'numeric'});
                }
            }
        },
        yaxis: {
            tooltip: {
                enabled: true
            }
        }
    };
    const fetchCandlestickData = async () => {
        const response = await axios.get(`https://cloud.iexapis.com/stable/stock/${ticker}/chart/${timeFrame}?token=pk_0ffe0f12ad544a11a534b7ee5b2f40bb&format=json`);
        console.log(response);
        const data = [];
        for (let i = 0; i < response.data.length; i++) {
            const ticker_data = response.data[i];
            if (timeFrame === '1mm' || timeFrame === '5dm') {
                data.push({
                    x: ticker_data['minute'] + " " + ticker_data['date'],
                    y: [ticker_data['open'].toFixed(2), ticker_data['high'].toFixed(2), ticker_data['low'].toFixed(2), ticker_data['close'].toFixed(2)]
                })
            } else {
                data.push({
                    x: ticker_data['date'],
                    y: [ticker_data['fOpen'].toFixed(2), ticker_data['fHigh'].toFixed(2), ticker_data['fLow'].toFixed(2), ticker_data['fClose'].toFixed(2)]
                });
            }
        }
        console.log('fetching data ...')
        setCandlestickData([ {data}]);
    }

    useEffect(() => {
        fetchCandlestickData();
    }, [timeFrame])
    
    const { TabPane } = Tabs;
    return (
        <Layout style={{ padding: '0 24px 24px' }}>
            <Content
                className="site-layout-background"
                style={{
                    padding: 24,
                    margin: 0,
                }}
            >
                  <Tabs defaultActiveKey="1m" onChange={(e) => setTimeFrame(e)}>
                        <TabPane tab="10 min" key="5dm"></TabPane>
                        <TabPane tab="30 min" key="1mm"></TabPane>
                        <TabPane tab="5D" key="5d"></TabPane>
                        <TabPane tab="1M" key="1m"></TabPane>
                        <TabPane tab="3M" key="3m"></TabPane>
                        <TabPane tab="6M" key="6m"></TabPane>
                        <TabPane tab="YTD" key="ytd"></TabPane>
                        <TabPane tab="1Y" key="1y"></TabPane>
                    </Tabs>
                <div id="chart">
                    <Chart options={options} series={candlestickData} type="candlestick" height={750} />
                </div>
            </Content>
        </Layout>
    )
}
export default CandlestickChart;