import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import DateBox from 'devextreme-react/date-box';
import { IoAddOutline } from "react-icons/io5";
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { HomeOutlined, EyeOutlined, PlusOutlined, DeleteOutlined, FormOutlined } from '@ant-design/icons';
import DropDownButton from 'devextreme-react/drop-down-button';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import moment from 'moment';
import AlertPopUp from "../../components/popup/alert_popup";
import ConfirmPopup from "../../components/popup/confirm_popup";
import {
  SimpleItem,
  GroupItem
} from 'devextreme-react/form';
import DataGrid, {
  Column,
  Grouping,
  GroupPanel,
  Paging,
  SearchPanel,
  Editing,
  Pager,
  Scrolling,
  Form,
  Button
} from 'devextreme-react/data-grid';
import AspNetData from 'devextreme-aspnet-data-nojquery';
import _ from "lodash";
import { Breadcrumb, Modal, TimePicker, Select } from 'antd';
import configService from '../../config';
const msgAlertTitle = configService.msgAlert;
const msgPopupTitle = configService.msgConfirm;
const url = 'https://js.devexpress.com/Demos/Mvc/api/TreeListTasks';
const format = "HH:mm A";

const tasksData = AspNetData.createStore({
  key: 'Task_ID',
  loadUrl: `${url}/Tasks`,
  insertUrl: `${url}/InsertTask`,
  updateUrl: `${url}/UpdateTask`,
  deleteUrl: `${url}/DeleteTask`,
  onBeforeSend: function (method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  }
});

let d = <FormOutlined />

const employeesData = AspNetData.createStore({
  key: 'ID',
  loadUrl: `${url}/TaskEmployees`
});

const statusesData = [
  'Not Started',
  'Need Assistance',
  'In Progress',
  'Deferred',
  'Completed'
];

class Work extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      itembar: [false, false, false],
      filter: {
        dateFrom: new Date(),
        dateTo: new Date(),
        projectId: null,
        typeId: null
      },
      projectList: [],
      jobtypeList: [],
      isPopupSuccess: false, // alert success case
      isPopupError: false,  // alert error case
      isPopupMsg: '',  // alert msg
      isOpen: false, // open popup confirm
      isTypeShowConfirm: '', // ประเภทของ popup : save , del
      isDataPopUp: {}, // ข้อมูลที่ใช้
      isTextMsg: '', // msg ของ Popup
      data: [
        {
          'workId': '0001',
          'projectId': '0001',
          'projectName': 'test1',
          'projectPhase': '1',
          'typeId': '0001',
          'typeName': 'test1',
          'workDate': '01/01/2021',
          'workDetail': '....',
          'workUrl': '-',
          'workManhour': '8',
          'workTimeIn': '09:00 AM',
          'workTimeOut': '18:00 PM',
          'updateDate': null,
          'updateBy': null,
          'createDate': '20/11/2020',
        }, {
          'workId': '0002',
          'projectId': '0002',
          'projectName': 'test2',
          'projectPhase': '1',
          'typeId': '0002',
          'typeName': 'test2',
          'workDate': '02/01/2021',
          'workDetail': '....',
          'workUrl': '-',
          'workManhour': '8',
          'workTimeIn': '09:00 AM',
          'workTimeOut': '18:00 PM',
          'updateDate': null,
          'updateBy': null,
          'createDate': '20/11/2020',
          'createBy': 'joon',
        }, {
          'workId': '0003',
          'projectId': '0003',
          'projectName': 'test3',
          'projectPhase': '1',
          'typeId': '0003',
          'typeName': 'test3',
          'workDate': '03/01/2021',
          'workDetail': '....',
          'workUrl': '-',
          'workManhour': '8',
          'workTimeIn': '09:00 AM',
          'workTimeOut': '18:00 PM',
          'updateDate': null,
          'updateBy': null,
          'createDate': '20/11/2020',
          'createBy': 'joon',
        }, {
          'workId': '0003',
          'projectId': '0003',
          'projectName': 'test3',
          'projectPhase': '1',
          'typeId': '0003',
          'typeName': 'test3',
          'workDate': '03/01/2021',
          'workDetail': '....',
          'workUrl': '-',
          'workManhour': '8',
          'workTimeIn': '09:00 AM',
          'workTimeOut': '18:00 PM',
          'updateDate': null,
          'updateBy': null,
          'createDate': '20/11/2020',
          'createBy': 'joon',
        }],
      popOver: {
        workId: '',
        visible: false
      },
      popupEditVisable: false
    };

    this.dataPopup = [
      { id: 1, name: 'Edit', icon: 'edit' },
      { id: 2, name: 'Delete', icon: 'trash' },
    ];

    // ปั้นวันที่ตามเดือนปัจจุบัน start
    this.dateOfCurrentMouth = []
    for (let i = 0; i < moment().daysInMonth(); i++) {
      this.dateOfCurrentMouth.push({ workDate: `${(i + 1) >= 10 ? i + 1 : '0' + (i + 1)}/${moment().format('MM')}/${moment().format('YYYY')}` })
    }

    // this.keyDelete = [];
    // ปั้นวันที่ตามเดือนปัจจุบัน end
  }

  componentDidMount() {
    this.getProjectList()
    this.getJobtypeList()
    this.fnSetDefaultDate()
  }

  // fnSetDefaultDate() {
  //   let temp = _.cloneDeep(this.dateOfCurrentMouth)
  //   for (const item of this.state.data) {
  //     temp.push(item)
  //   }
  //   console.log("TCL: fnSetDefaultDate -> temp", temp)


  //   this.setState({ data: temp })
  fnSetDefaultDate() {
    let temp = _.cloneDeep(this.dateOfCurrentMouth)
    // เอาค่าของ workDate ออกมา
    let dataWorkDate = this.state.data.map(r => r.workDate)
    // เอาค่าที่ไม่ซ้ำของ workDate
    temp = temp.filter(r => dataWorkDate.indexOf(r.workDate) === -1)
    for (const item of this.state.data) {
      temp.push(item)
    }
    console.log("TCL: fnSetDefaultDate -> temp", temp)
    this.setState({ data: temp })
  }

  getProjectList() {
    this.setState({
      projectList: [{
        projectId: '001',
        projectName: 'test1'
      },
      {
        projectId: '002',
        projectName: 'test2'
      }]
    })
  }

  getJobtypeList() {
    this.setState({
      jobtypeList: [{
        typeId: '001',
        typeName: 'test1'
      },
      {
        typeId: '002',
        typeName: 'test2'
      }]
    })
    // console.log("Work -> getJobtypeList -> this.state.jobtypeList", this.state.jobtypeList)
  }

  handleProjectChange = (event) => {

    let temp = _.cloneDeep(this.state.filter)
    temp.projectId = event.target.value
    this.setState({
      filter: {
        dateFrom: temp.dateFrom,
        dateTo: temp.dateTo,
        typeId: temp.typeId,
        projectId: event.target.value
      }
    });
  }
  handleTypeChange = (event) => {

    let temp = _.cloneDeep(this.state.filter)
    temp.typeId = event.target.value
    this.setState({
      filter: {
        dateFrom: temp.dateFrom,
        dateTo: temp.dateTo,
        typeId: temp.typeId,
        projectId: temp.projectId
      }
    });
  }

  handleChangeDate = (event, type) => {
    let temp = _.cloneDeep(this.state.filter)
    if (type === 'from') {
      this.setState({
        filter: {
          dateFrom: event.value,
          dateTo: temp.dateTo,
          typeId: temp.typeId,
          projectId: temp.projectId
        }
      });
    } else {
      this.setState({
        filter: {
          dateFrom: temp.dateFrom,
          dateTo: event.value,
          typeId: temp.typeId,
          projectId: temp.projectId
        }
      });

    }
  }

  handleReset = () => {
    this.setState({
      filter: {
        dateFrom: new Date(),
        dateTo: new Date(),
        projectId: null,
        typeId: null
      }
    })
  }

  groupRender = (data) => {
    console.log("groupRender -> data", data)
    // ข้อความ ดำ > บันทึกแล้ว
    // ข้อความ แดง > ไม่บันทึก / ส - อ
    // ข้อความ น้ำเงิน > ปัจจุบัน
    let day = moment(data.value, 'DD/MM/YYYY').format('dddd')
    let id = data.data.items && data.data.items.length > 0 ? data.data.items[0].workId : data.data.collapsedItems && data.data.collapsedItems.length > 0 ? data.data.collapsedItems[0].workId : null
    let name = `DATE : ${data.value}  ${day}`
    let now = moment().format('DD/MM/YYYY');
    return (<div className="row">
      <div style={{ fontSize: '12pt' }} className={`col-6 ${day === 'Sunday' || day === 'Saturday' ? 'color-red' : data.value === now ? 'color-blue' : 'color-black'}`}>
        {name}
      </div>

      {/* ปุ่มบวก : */}

      {/* {data.data.items[0].workId} */}
      {data.data.items.length === 0 || data.data.items[0].workId === undefined ?
        <div className="col-6" style={{ textAlign: 'end',center: '-10px' }}>
          <Link to='/work/{"action":"create"}'>
            <button className="btn-custom btn-search " style={{ width: '40px', hight: '20px', borderRadius: '50%', }}><span className="btn-icon"><IoAddOutline /></span> </button>

          </Link>
        </div> :
        <div className="col-6" style={{ textAlign: 'end', left: '-10px' }}>
          <Link to={"/work" + `/{"action":"edit","workId":"${id}"}`}>
            <span className="custom-icon-group" style={{ color: 'black', fontSize: '12pt', marginRight: 20 }}><FormOutlined /></span>
          </Link>
          <a className="custom-icon-group" onClick={() => {
            this.setState({ isOpen: true, isTypeShowConfirm: 'del', isTextMsg: msgPopupTitle.deleted, isDataPopUp: this.state.data })
          }}><span style={{ color: '#111', fontSize: '12pt', marginRight: 20 }}><DeleteOutlined /></span></a>
        </div>}

    </div>
    )
  }


  actionRender = (data) => {
    return (<> {data.key && data.key.workId ?
      <DropDownButton
        text="..."
        dropDownOptions={{ width: 100 }}
        items={this.dataPopup}
        displayExpr="name"
        keyExpr="id"
        onItemClick={(e) => { this.onItemClick(e, data) }}
      /> : null}
    </>)
  }

  onItemClick = (e, data) => {
    if (e.itemData.name === 'Edit') {
      this.setState({ popupEditVisable: true })
    } else if (e.itemData.name === 'Delete') {
      // call function delete
    }
  }

  calManHours = () => {

  }

  onEditorPreparing(e) {
    console.log("TCL: onEditorPreparing -> e ===> ", e)
    if (e.parentType === 'dataRow' && e.dataField === 'Position') {
      e.editorOptions.readOnly = this.isChief(e.value);
    }
  }
  onEditorPrepared(e) {
    console.log("TCL: onEditorPrepared -> e ===> ", e)
  }
  onInitNewRow(e) {
    console.log("TCL: onInitNewRow -> e ===> ", e)
  }
  onContentReady(e) {
    console.log("TCL: onContentReady -> e ===> ", e)
  }
  onRowPrepared(e) {
    // แถบสี ม่วง > จ-ศ
    // แถบสี เทา > ส-อ
    if (e.rowType === 'group') {
      // console.log("TCL: onRowPrepared -> e ===> ", e)
      let day = moment(e.key[0], 'DD/MM/YYYY').format('dddd')
      if (day !== 'Sunday' && day !== 'Saturday') {
        e.rowElement.style.backgroundColor = 'rgb(232 211 255)';
      } else {
        e.rowElement.style.backgroundColor = '#ddd';
      }
      if (e.cells) {
        if (e.cells[0]) {
          if ((e.cells[0].data.collapsedItems && e.cells[0].data.collapsedItems[0] && e.cells[0].data.collapsedItems[0].workId) || (e.cells[0].data.items && e.cells[0].data.items[0] && e.cells[0].data.items[0].workId)) {
            // e.component.expandRow(e.component.getKeyByRowIndex(e.rowIndex));
          }
        }
      }
    }
  }

  render() {

    return (<>

      <div className="App">
        <div id="boxType" className="container-box-content">
          <div className="row wrap-container">
            <Breadcrumb>
              {/* <Breadcrumb.Item href="#"> */}
              <HomeOutlined />
              <span className="breadcrum-custom"> Work</span>
              {/* </Breadcrumb.Item> */}
            </Breadcrumb>

            <div className="wrap-content">
              <div className="box-search">
                <div className="box-title-search">
                  <p className="font-size-search">Search Work</p>

                </div>
                <div className="box-content">
                  <div className="box-search-border">
                    <form>

                      {/*  Dropdown */}
                      <div className="row">
                        <div className="col-6">
                          <div className="row form-group">
                            <div className="col-4"><label for="ddlProjectName" className="title-field">Project Name</label></div>
                            <select class="form-control col-7" id="ddlProjectName" value={this.state.filter.projectId} onChange={this.handleProjectChange}>
                              {
                                this.state.projectList.map(r => {
                                  // console.log(r, r.projectId == this.state.filter.projectId)
                                  return <option value={r.projectId} selected={r.projectId == this.state.filter.projectId}>{r.projectName}</option>

                                })
                              }
                            </select>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="row form-group">
                            <div className="col-4"><label for="ddlJobType" className="title-field">Job Type</label></div>
                            <select class="form-control col-7" id="ddlJobType" value={this.state.filter.typeId} onChange={this.handleTypeChange}>
                              {
                                this.state.jobtypeList.map(r => {
                                  // console.log("Work -> render -> r", r)
                                  return <option value={r.typeId} selected={r.typeId == this.state.filter.typeId}>{r.typeName}</option>
                                })
                              }
                            </select>
                          </div>
                        </div>
                      </div>

                      {/*  วันที่ */}
                      <div className="row">
                        <div className="col-6">
                          <div className="row form-group">
                            <div className="col-4"><label for="ddlDateFrom" className="title-field">Date : From</label></div>
                            <div className="col-7" style={{ paddingLeft: 0, paddingRight: 0 }}>
                              <DateBox
                                value={this.state.filter.dateFrom}
                                type="date" onValueChanged={(e) => {
                                  this.handleChangeDate(e, 'from')
                                }} />
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="row form-group">
                            <div className="col-4"><label for="ddlDateTo" className="title-field">Date : To</label></div>
                            <div className="col-7" style={{ paddingLeft: 0, paddingRight: 0 }}>
                              <DateBox value={this.state.filter.dateTo}
                                type="date" type="date" onValueChanged={(e) => {
                                  this.handleChangeDate(e, 'to')
                                }} />
                            </div>
                          </div>
                        </div>


                      </div>
                    </form>

                    <div className="row form-group">
                      <div className="col-12" style={{ textAlign: 'center' }}>
                        <button class="btn-custom btn-reset " style={{ marginRight: 20 }} onClick={this.handleReset}>RESET</button>
                        <button class="btn-custom btn-search ">SEARCH</button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* content start*/}
            <div className="wrap-content">
              <div className="box-search" style={{ padding: 30 }}>
                <div style={{ textAlign: 'end', padding: 15 }}>
                  <Link to='/work/{"action":"create"}'>
                    <button className="btn-custom btn-search " style={{ width: 185 }}><span className="btn-icon"><IoAddOutline /></span> <span className="btn-txt-icon">Create Work</span></button>

                  </Link>
                </div>
                <div style={{ padding: 20 }} className="table-responsive">
                  <DataGrid
                    dataSource={this.state.data}
                    allowColumnReordering={false}
                    showBorders={true}
                    onEditorPreparing={this.onEditorPreparing}
                    onEditorPrepared={this.onEditorPrepared}
                    onInitNewRow={this.onInitNewRow}
                    onRowPrepared={this.onRowPrepared}
                    onContentReady={this.onContentReady}
                  // columnWidth={100}
                  >
                    <Editing
                      mode="row"
                      confirmDelete={false}
                    />
                    <Scrolling columnRenderingMode="virtual" />
                    <GroupPanel visible={false}
                    />
                    <SearchPanel visible={false} />
                    <Grouping autoExpandAll={true} allowCollapsing={true} />
                    <Paging defaultPageSize={10} />
                    <Pager
                      showPageSizeSelector={true}
                      allowedPageSizes={[100, 250, 500, 1000]}
                      showInfo={true}
                      showNavigationButtons={true}
                    />

                    <Column dataField="projectName" caption="Project" dataType="string" />
                    <Column dataField="projectPhase" caption="Phase" dataType="string" />
                    <Column dataField="typeName" caption="Type" dataType="string" />
                    <Column dataField="workDetail" caption="Detail" dataType="string" />
                    <Column dataField="workManhour" caption="Man Hours" dataType="string" />
                    <Column dataField="workTimeIn" caption="Time In" dataType="string" />
                    <Column dataField="workTimeOut" caption="Time Out" dataType="string" />
                    <Column caption="Edit Delete" alignment="center" width={110} cellRender={this.actionRender}>

                    </Column>
                    <Column className="color-red" dataField="workDate" groupIndex={0} groupCellRender={this.groupRender} />
                  </DataGrid>
                </div>
              </div>
            </div>
            {/* content end*/}



          </div>

        </div>
      </div>

      {/* POPUP */}
      <AlertPopUp successStatus={this.state.isPopupSuccess} errorStatus={this.state.isPopupError} message={this.state.isPopupMsg}
        clearActive={() => {
          this.setState({ isPopupError: false })
          this.setState({ isPopupSuccess: false })
        }} />

      <ConfirmPopup open={this.state.isOpen} type={this.state.isTypeShowConfirm} text={this.state.isTextMsg} data={this.state.isDataPopUp} del={false}
        onClose={() => { this.setState({ isOpen: false }) }}
        clearActive={(e) => { this.setState({ isOpen: false }) }}
        confirmActive={(e) => {
          this.setState({ isOpen: false })
          this.setState({ isPopupError: false })
          this.setState({ isPopupSuccess: true })
          this.setState({ isPopupMsg: msgAlertTitle.deleted })
          // console.log("Work -> render -> e", e)
        }}
      />

      <Modal centered
        footer={null}
        header={null}
        visible={this.state.popupEditVisable}
        width={800}
        closable={false}
        onOk={() => {
          this.setState({ popupEditVisable: false })
        }}
      >
        {this.state.popupEditVisable ?
          // <div className="wrap-content">
          // <div className=" col-12 box-action">
          <div className="box-title-search">
            <p className="font-size-search"> Update Work </p>
            {/* </div> */}

            <div className="box-action-content">
              <div className="row form-group">
                <div className="col-6">
                  <div className="row">
                    <div
                      className="col-5"
                      style={{ textAlign: "right" }}
                    >
                      <label
                        className="title-field"
                        for="ddlProjectName"
                      >

                        Project Name
                                      <span style={{ color: "red" }}> * </span>
                      </label>
                    </div>
                    <div className="col-6">
                      <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Please selete project"
                        optionFilterProp="children"
                        onChange={(e) => {
                          // this.handleChangeProject(e, i);
                        }}
                        onFocus={(e) => {
                          // this.handleFocusProject(e, i);
                        }}
                        onBlur={(e) => {
                          // this.handleBlurProject(e, i);
                        }}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      // value={data.projectId}
                      >

                        {/* {this.projectList} */}
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="row">
                    <div
                      className="col-4"
                      style={{ textAlign: "right" }}
                    >
                      <label
                        className="title-field"
                        for="ddlJobType"
                      >

                        Job Type
                                      <span style={{ color: "red" }}> * </span>
                      </label>
                    </div>
                    <div className="col-6">
                      <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Please selete Type"
                        optionFilterProp="children"
                        onChange={(e) => {
                          // this.handleChangeType(e, i);
                        }}
                        onFocus={(e) => {
                          // this.handleFocusType(e, i);
                        }}
                        onBlur={(e) => {
                          // this.handleBlurType(e);
                        }}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      // value={ }
                      >

                        {/* {this.typeList} */}
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              {/* Time in */}
              <div className="row form-group" >
                <div className="col-6">
                  <div className="row">
                    <div
                      className="col-5"
                      style={{ textAlign: "right" }}
                    >
                      <label
                        className="title-field"
                        for="ddlTimeIn"
                      >

                        Time in
                                      <span style={{ color: "red" }}> * </span>
                      </label>
                    </div>
                    <div className="col-6">
                      <TimePicker
                        showNow={true}
                        className="font-12pt"
                        style={{ fontSize: "12pt" }}
                        use12Hours
                        placeholder="Select time in"
                        format={format}
                        // value={ }
                        showNow={true}
                        onChange={(time, timestring) => {
                          // this.onChangeTimeIn(
                          //   time,
                          //   timestring,
                          //   i
                          // );
                        }}
                      />
                    </div>
                  </div>
                </div>
                {/* Time out */}
                <div className="col-6">
                  <div className="row">
                    <div
                      className="col-4"
                      style={{ textAlign: "right" }}
                    >
                      <label
                        className="title-field"
                        for="ddlTimeOut"
                      >

                        Time out
                                      <span style={{ color: "red" }}> * </span>
                      </label>
                    </div>
                    <div className="col-6">
                      <TimePicker
                        showNow={true}
                        className="font-12pt"
                        style={{ fontSize: "12pt" }}
                        use12Hours
                        placeholder="Select Time out"
                        format={format}
                        // value={data.workTimeOut}
                        showNow={true}
                        onChange={(time, timestring) => {
                          // this.onChangeTimeOut(
                          //   time,
                          //   timestring,
                          //   i
                          // );
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Man hours */}
              <div className="row form-group">
                <div className="col-6">
                  <div className="row">
                    <div
                      className="col-5"
                      style={{ textAlign: "right" }}
                    >
                      <label
                        className="title-field"
                        for="txtManHours"
                      >
                        Man hours
                                      <span style={{ color: "red" }}> * </span>
                      </label>
                    </div>
                    <div className="col-4">
                      <input
                        type="text"
                        class="form-control"
                        id="txtManHours"
                      />
                    </div>
                    <div className="col-2">
                      <button
                        class="btn-custom btn-calculate"
                        onClick={this.calManHours}
                      >

                        Calculate
                                    </button>
                    </div>
                  </div>
                </div>
                {/* Url */}
                <div className="col-6">
                  <div className="row">
                    <div
                      className="col-4"
                      style={{ textAlign: "right" }}
                    >
                      <label className="title-field" for="txtUrl">

                        Url
                                      <span style={{ color: "red" }}>  </span>
                      </label>
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        class="form-control"
                        id="txtUrl"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Detail */}
              <div className="row form-group">
                <div className="col-6">
                  <div className="row">
                    <div
                      className="col-5"
                      style={{ textAlign: "right" }}
                    >
                      <label
                        className=" title-field"
                        for="txtDetail"
                      >

                        Detail
                                      <span style={{ color: "red" }}> * </span>
                      </label>
                    </div>
                    <div className="col-7">
                      <textarea
                        rows="3"
                        type="text"
                        class="form-control"
                        id="txtDetail"
                        style={{ width: '29.2rem' }}
                      />
                      {/* </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row form-group">
              <div className="col-12" style={{ textAlign: "right", padding: 20 }}>
                <button
                  class="btn-custom btn-reset"
                  style={{ marginRight: 20 }}
                  onClick={() => {
                    this.setState({ popupEditVisable: false })
                  }}
                >


                  CANCEL
                        </button>
                <button
                  class="btn-custom btn-search"
                  style={{ marginRight: 0 }}
                // onClick={() => {
                //   this.setState({
                //     isOpen: true,
                //     isTypeShowConfirm: "save",
                //     isTextMsg: msgPopupTitle.saved,
                //     isDataPopUp: this.state.data,
                //     isDelete: false,
                //   });
                // }}
                >
                  UPDATE
                   </button>
              </div>
            </div>
          </div>
          : null}

      </Modal>
    </>);
  }
}


export default Work;
