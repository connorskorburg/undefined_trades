import React, { useContext } from 'react';
import 'antd/dist/antd.css';
import { Layout } from 'antd';
import TickerContext from '../../context/ticker/tickerContext';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';


const CandlestickChart = () => {
    const { Content } = Layout;
    const context = useContext(TickerContext);
    const { ticker } = context;
    return (
        <Layout style={{ padding: '0 24px 24px' }}>
            <Content
                className="site-layout-background"
                style={{
                    padding: 24,
                    margin: 0,
                }}
            >
                <div id="chart" style={{ paddingTop: '0.55rem', display: 'flex'}}>
                    <TradingViewWidget
                        symbol={ticker}
                        theme={Themes.LIGHT}
                        locale="us"
                    />
                </div>
            </Content>
        </Layout>
    )
}
export default CandlestickChart;