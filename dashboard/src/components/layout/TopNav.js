import React from 'react';
import 'antd/dist/antd.css';
import { Layout } from 'antd';

const TopNav = () => {
    const { Header } = Layout;
    return (
        <Header style={{ backgroundColor: '#fff'}} className="header">
            <h3 style={{ color: '#000', fontWeight: 'bold'}}>undefined trades</h3>
        </Header>
    )
}
export default TopNav;