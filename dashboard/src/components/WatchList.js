import React, { useState, useEffect } from 'react';
import 'antd/dist/antd.css';
import { Modal, Layout, Button, Table, Input } from 'antd';
import axios from 'axios';

const WatchList = () => {
    const { Sider } = Layout;
    const [watchList, setWatchList] = useState([]);
    const [tickers, setTickers] = useState(localStorage.getItem('tickers') || '')
    const [ticker, setTicker] = useState('')
    const [showTickerModal, setShowTickerModal] = useState(false);

    const fetchWatchList = async () => {
        const response = await axios.get(`http://localhost:5000/daily_scanner`, { params: { 'tickers': tickers } } )
        setWatchList(response.data.data);
    }

    const handleTickerChange = e => {
        setTicker(e.target.value.toUpperCase());
    }

    const addTicker = () => {
        const newTickers = tickers + ' ' + ticker;
        localStorage.setItem('tickers', newTickers);
        const savedTickers = localStorage.getItem('tickers');
        setTickers(savedTickers);
        setTicker('');
    }
    
    const showRemoveTicker = (record, event) => {
        setTicker(record.ticker);
        setShowTickerModal(true);
    }

    const removeTicker = ticker => {
        let newTickers = tickers.replace(ticker).split(" ").filter(record => (record && record !== 'undefined') && record).join(" ");
        localStorage.setItem('tickers', newTickers);
        setTickers(newTickers);
        setTicker('')
        setShowTickerModal(false);
    }

    const columns = [
        {
          title: 'Symbol',
          dataIndex: 'ticker',
          key: 'ticker',
          render: text => <>{`$${text}`}</>
        },
        {
          title: 'Price',
          dataIndex: 'close',
          key: 'close',
          render: text => <>{`$${text}`}</>
        }
    ];

    useEffect(() => {
        fetchWatchList();
    }, [tickers])

    return (
        <Sider style={{ backgroundColor: '#fff'}} width={250} className="site-layout-background">
            <Modal
                visible={showTickerModal}
                onCancel={() => setShowTickerModal(false)}
                onOk={() => removeTicker(ticker)}
            >
                <p>{`Are you sure you want to remove $${ticker} from your watchlist?`}</p>
            </Modal>
            <div style={{ display: 'flex' }}>
                <Input type='text' value={ticker} onChange={(e) => handleTickerChange(e)} />
                <Button type='primary' onClick={() => addTicker()}>Add</Button>
            </div>
            <Table 
                columns={columns}
                dataSource={watchList}
                pagination={false}
                onRow={(record) => {
                    return {
                      onClick: event => showRemoveTicker(record, event),
                    //   onClick: event => console.log(event, record),
                    }}
                }
                // onClick={(row) => showRemoveTicker(row)}
            />
        </Sider>
    )
}

export default WatchList;