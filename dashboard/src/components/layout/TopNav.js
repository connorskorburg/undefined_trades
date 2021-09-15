import React from 'react';
import 'antd/dist/antd.css';
import { Layout } from 'antd';

const TopNav = () => {
    const { Header } = Layout;
    return (
        <Header className="header">
            <h3 style={{ color: '#fff', fontWeight: 'bold'}}>undefined trades</h3>
        </Header>
    )
}
export default TopNav;