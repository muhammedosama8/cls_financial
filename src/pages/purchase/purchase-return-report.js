import Image from 'next/image';
import Link from 'next/link';
import {useState, useEffect, useRef} from 'react';
import Layout from '@/components/layout';

import { useDownloadExcel } from 'react-export-table-to-excel';

import HeaderTitle from '@/components/header-title';
import getTranslation from '@/languages';
import apiUrl from '@/components/api-url';
import { toast, ToastContainer } from 'react-toastify';
import router from 'next/router';
import AccountsNumberFormat from '@/components/accounts-number-format';
import CompanyInfo from '@/components/company-info';

const PurchaseReturnReport = ()=> {
    let user_id, user_group, user_company, user_branch;
    if (typeof window !== 'undefined') {
        user_id         = localStorage.getItem('user_id');
        user_group      = localStorage.getItem('user_group');
        user_company    = localStorage.getItem('user_company');
        user_branch     = localStorage.getItem('user_branch');

        // user_group =1 Super Admin, user_group =2 Admin, user_group =3 Manager, user_group =4 Accounts User, user_group =5 Sales & Purchase, user_group =6 Sales, user_group =7 Purchase
        if(user_group == 1 || user_group == 2 || user_group == 3 || user_group == 3 || user_group == 4 || user_group == 5 || user_group == 6 || user_group == 7) { } else {
            router.replace('/logout');
            return true;
        }
    }

    const lang = getTranslation();

    const [searchButton, setSearchButton]               = useState(false);
    
    const [company_list, setCompany_list]               = useState([]);
    const [branch_list, setBranch_list]                 = useState([]);
    const [supplier_list, setSupplier_list]             = useState([]);
    const status_list = [
        {
            status_id:1,
            status_code: 'A',
            status_name: 'Active'
        },
        {
            status_id:0,
            status_code: 'I',
            status_name: 'Inactive'
        }
    ];
    const [purchase_return_report, setPurchase_return_report]         = useState([]);
    const total_purchase_return_amount = purchase_return_report.reduce((amount, data) => amount + parseFloat((data.purchase_return_payable_amount)), 0);
    const total_paid_amount     = purchase_return_report.reduce((amount, data) => amount + parseFloat((data.purchase_return_paid_amount)), 0);
    const total_due_amount      = purchase_return_report.reduce((amount, data) => amount + parseFloat((data.purchase_return_due_amount)), 0);

    const [company_info, setCompany_info]               = useState('');
    const [branch_info, setBranch_info]                 = useState('');
    const [supplier_info, setSupplier_info]             = useState('');
    const [company, setCompany]                         = useState(user_company || '');
    const [branch, setBranch]                           = useState(user_branch || '');
    const [supplier, setSupplier]                       = useState('all');
    const [from_date, setFrom_date]                     = useState(new Date().toISOString().split('T')[0]);
    const [to_date, setTo_date]                         = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus]                           = useState(1);

    const companyData = () => {
        const axios = apiUrl.get("/company/company-list-active");
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setCompany_list(result_data.data);
            } else {
                setCompany_list([]);
            }
        }).catch((e) => console.log(e));
    }

    const branchData = () => {
        const axios = apiUrl.get("/branch/branch-list-active/"+company);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setBranch_list(result_data.data);
            } else {
                setBranch_list([]);
            }
        }).catch((e) => console.log(e));
    }
    const supplierData = () => {
        const axios = apiUrl.get("/suppliers/supplier-list-active/"+company)
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setSupplier_list(result_data.data);
            } else {
                setSupplier_list([]);
            }
        }).catch((e) => console.log(e));
    }

    const searchPurchaseReturnReport = () => {
        setSearchButton(true);
        const axios = apiUrl.get("/purchase/purchase-return-report/?company="+company+"&branch="+branch+"&supplier="+supplier+"&from_date="+from_date+"&to_date="+to_date+"&status="+status);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setPurchase_return_report(result_data.data);
                setCompany_info(result_data.company);
                setBranch_info(result_data.branch);
                setSupplier_info(result_data.supplier);
                setSearchButton(false);
            } else {
                setPurchase_return_report([]);
                setCompany_info('');
                setBranch_info('');
                setSupplier_info('');
                setSearchButton(false);
            }
        }).catch((e) => console.log(e));
    }

    useEffect(() => {
        companyData();
        branchData();
        supplierData();
    }, [company]);

    return (
        
        <Layout>
            <style>
            
        </style>
            <HeaderTitle title={lang.purchase_return_report} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5 d-print-none">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.purchase_return_report}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/purchase">{lang.purchase}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.purchase_return_report}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center d-print-none">
                            <button type="button" className="btn btn-primary rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.print} onClick={() => window.print()}><i className="fal fa-print"></i></button>
                        </div>
                    </div>
                </div>
                {/* Breadcrumb End */}

                {/* Content Start */}
                <div className="row">
                    <div className="col-md-12 mg-b-15">
                        <div className="row clearfix d-print-none">
                            <div className="col-md-4 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-semibold" htmlFor="company">{lang.company}</label>
                                    <select type="text" className="form-control bd-info" id="company" name="company" value={company} onChange={(e) => setCompany(e.target.value)}>
                                        <option value="">{lang.select}</option>
                                        {company_list.map(company_row => (
                                        <option key={company_row.company_id} value={company_row.company_id}>{company_row.company_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="col-md-4 col-sm-12 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-semibold" htmlFor="branch">{lang.branch}</label>
                                    <select type="text" className="form-control bd-info" id="branch" name="branch" value={branch} onChange={(e) => setBranch(e.target.value)}>
                                        <option value="">{lang.select}</option>
                                        {branch_list.map(branch_row => (
                                        <option key={branch_row.branch_id} value={branch_row.branch_id}>{branch_row.branch_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-semibold" htmlFor="supplier">{lang.supplier}</label>
                                    <select type="text" className="form-control bd-info" id="supplier" name="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
                                        <option value="all">All</option>
                                        {supplier_list.map(supplier_row => (
                                        <option key={supplier_row.supplier_id} value={supplier_row.supplier_id}>{supplier_row.supplier_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="row clearfix mb-3 d-print-none">
                            <div className="col-md-4 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-semibold" htmlFor="from_date">{lang.from_date}</label>
                                    <input type="date" className="form-control bd-info" id="from_date" name="from_date" value={from_date} onChange={(e) => setFrom_date(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-4 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-semibold" htmlFor="to_date">{lang.to_date}</label>
                                    <input type="date" className="form-control bd-info" id="search" name="to_date" value={to_date} onChange={(e) => setTo_date(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-2 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-semibold" htmlFor="status">{lang.status}</label>
                                    <select type="text" className="form-control bd-info" id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                                        {status_list.map(status_row => (
                                        <option key={status_row.status_id} value={status_row.status_id}>{status_row.status_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-2 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="search">&nbsp;</label>
                                    <div className="d-grid gap-2">
                                        <button type="submit" className={`btn btn-success pd-t-6-force pd-b-5-force mg-r-3 tx-uppercase ${searchButton?'disabled': ''}`} onClick={() => searchPurchaseReturnReport()}>{searchButton?lang.process: lang.search}</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {company_info &&
                        <div className="row clearfix mb-3 d-none d-print-block">
                            <div className="col-md-12 tx-center">
                                <CompanyInfo company_data={company_info} branch_data={branch_info} />
                                <table className="mt-3" width="100%" align="center">
                                    <tbody>
                                        <tr className="">
                                            <th className="tx-left" width="30%" valign="top">
                                            </th>
                                            <th className="tx-center tx-uppercase" width="40%" valign="top">
                                                <span className='tx-uppercase tx-16 text-decoration-underline'>{lang.purchase_return_report}</span>
                                            </th>
                                            <th className="tx-right" width="30%" valign="top">
                                                {lang.print}: {new Date().toLocaleString("en-in", { day : '2-digit', month: '2-digit', year:'numeric', hour: "2-digit", minute: "2-digit"})}
                                            </th>
                                        </tr>
                                        <tr className="">
                                            <th className="tx-center tx-uppercase" colSpan="3" valign="top">
                                                From the Date of {new Date(from_date).toLocaleString("en-US", { day : '2-digit', month: 'short', year:'numeric'})} to {new Date(to_date).toLocaleString("en-US", { day : '2-digit', month: 'short', year:'numeric'})}
                                            </th>
                                        </tr>
                                        <tr className="">
                                            <th className="tx-left" colSpan="3" valign="top">
                                                {lang.supplier}: {supplier_info.supplier_name}<br/>
                                                {lang.status}: {status==1?lang.active:lang.inactive}
                                            </th>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        }

                        <div className="table-responsive">
                        {searchButton?
                            <table className="table table-striped table-bordered">
                                <tbody>
                                    <tr className=''>
                                        <th className="tx-center d-print-none">
                                            <Image src="/assets/images/loading/loader.gif" alt="Loading" width={40} height={40} />
                                        </th>
                                    </tr>
                                </tbody>
                            </table>
                            :<>
                            {purchase_return_report.length > 0 ?
                            <>
                            <table className="table table-striped table-bordered" width="100%">
                                <thead className="tx-12 tx-uppercase">
                                    <tr>
                                        <th className="tx-center">{lang.sn}</th>
                                        <th className="tx-center">{lang.date}</th>
                                        <th className="tx-center">{lang.invoice}</th>
                                        <th className="tx-center">{lang.supplier}</th>
                                        <th className="tx-center">{lang.payable}</th>
                                        <th className="tx-center">{lang.paid}</th>
                                        <th className="tx-center">{lang.due}</th>
                                        <th className="tx-center">{lang.payment}<br/>{lang.status}</th>
                                    </tr>
                                </thead>
                                {searchButton?
                                <tbody>
                                    <tr className=''>
                                        <th className="tx-center d-print-none" colSpan={15}>
                                            <Image src="/assets/images/loading/loader.gif" alt="Loading" width={40} height={40} />
                                        </th>
                                    </tr>
                                </tbody>
                                :
                                <tbody>
                                    {purchase_return_report.map((row, index) => {
                                    return (
                                    <tr className='' key={row.purchase_return_id}>
                                        <td className="tx-center">{(index+1).toString().padStart(2, '0')}</td>
                                        <td className="tx-center">{new Date(row.purchase_return_date).toLocaleString('en-in', {day: '2-digit', month:'2-digit', year: 'numeric'})}</td>
                                        <td className="tx-center">{row.purchase_return_purchase_invoice}</td>
                                        <td className="tx-left">{row.purchase_return_supplier_name}</td>
                                        <td className="tx-right"><AccountsNumberFormat amount={row.purchase_return_payable_amount}/></td>
                                        <td className="tx-right"><AccountsNumberFormat amount={row.purchase_return_paid_amount}/></td>
                                        <td className="tx-right"><AccountsNumberFormat amount={row.purchase_return_due_amount}/></td>
                                        <td className="tx-center">{row.purchase_return_payment_status}</td>
                                    </tr>
                                    )})}
                                    <tr className="">
                                        <th className="tx-right text-uppercase" colSpan={4}>{lang.total}</th>
                                        <th className="tx-right"><AccountsNumberFormat amount={total_purchase_return_amount} /></th>
                                        <th className="tx-right"><AccountsNumberFormat amount={total_paid_amount} /></th>
                                        <th className="tx-right"><AccountsNumberFormat amount={total_due_amount} /></th>
                                        <th className="tx-center"></th>
                                    </tr>
                                </tbody>
                                }
                            </table>
                            <br/><br/><br/><br/>
                            <table className="" width="100%" align="center">
                                <tbody>
                                    <tr className="text-uppercase">
                                        <th width="20%" className="tx-center"></th>
                                        <th width="20%"></th>
                                        <th width="20%" className="tx-center"></th>
                                        <th width="20%"></th>
                                        <th width="20%" className="tx-center bd-top">{lang.prepared_by}</th>
                                    </tr>
                                </tbody>
                            </table>
                            </>
                            : ''}
                            </>
                            }
                        </div>
                    </div>
                </div>
                {/* Content End */}
            </div>
        </Layout>
    );
}

export default PurchaseReturnReport;