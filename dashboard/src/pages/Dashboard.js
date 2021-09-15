import React from 'react';
import 'antd/dist/antd.css';
import { Layout } from 'antd';
import WatchList from '../components/WatchList';
import CandlestickChart from '../components/charts/CandlestickChart';
import TopNav from '../components/layout/TopNav';

const Dashboard = () => {
    return (
        <Layout style={{ minHeight: '100vh'}}>
            <TopNav />
            <Layout>
                <WatchList />
                <CandlestickChart />
            </Layout>
        </Layout>
    )
}
export default Dashboard;