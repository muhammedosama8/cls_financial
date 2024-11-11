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

const ProductType = ()=> {
    let user_id, user_group, user_company;
    if (typeof window !== 'undefined') {
        user_id         = localStorage.getItem('user_id');
        user_group      = localStorage.getItem('user_group');
        user_company    = localStorage.getItem('user_company');

        // user_group =1 Super Admin, user_group =2 Admin, user_group =3 Manager, user_group =4 Accounts User, user_group =5 Sales & Purchase
        if(user_group == 1 || user_group == 2 || user_group == 3 || user_group == 3 || user_group == 4 || user_group == 5) { } else {
            router.replace('/logout');
            return true;
        }
    }

    const lang = getTranslation();

    const [onProcess, setOnProcess]             = useState(false);

    const excelExportRef                        = useRef(null);
    const { onDownload } = useDownloadExcel({
        currentTableRef : excelExportRef.current,
        filename        : 'product-type-list',
        sheet           : 'Product Type'
    });

    const [user_user_group, setUser_user_group]         = useState('');
    const [showFormModal, setShowFormModal]             = useState(false);
    const [showFormModalDelete, setShowFormModalDelete] = useState(false);
    const [company_list, setCompany_list]               = useState([]);
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

    const [product_type_list, setProduct_type_list]                 = useState([]);
    const [product_type_id, setProduct_type_id]                     = useState(0);
    const [product_type_company, setProduct_type_company]           = useState('');
    const [product_type_code, setProduct_type_code]                 = useState('');
    const [product_type_name, setProduct_type_name]                 = useState('');
    const [product_type_status, setProduct_type_status]             = useState(1);

    const [company, setCompany]                         = useState(user_company || '');
    const [status, setStatus]                           = useState('all');
    const [search, setSearch]                           = useState('');

    const formModal = (primary_id) => {
        setProduct_type_id(primary_id);
        if(primary_id > 0) {
            const axios = apiUrl.get("/product-type/get-product-type/"+primary_id)
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setProduct_type_id(result_data.data.product_type_id);
                    setProduct_type_company(result_data.data.product_type_company);
                    setProduct_type_code(result_data.data.product_type_code);
                    setProduct_type_name(result_data.data.product_type_name);
                    setProduct_type_status(result_data.data.product_type_status);
                } else {
                    setTimeout(() => {
                        toast.error(result_data.message, {
                            position: toast.POSITION.TOP_RIGHT,
                            autoClose: 1000,
                        });
                    }, 300);
                }
            }).catch((e) => console.log(e));
        }
        setShowFormModal(true);
    }

    const formModalDelete = (primary_id) => {
        setProduct_type_id(primary_id);
        setShowFormModalDelete(true);
    }

    const FormModalClose = () => {
        setProduct_type_id(0);
        setProduct_type_company('');
        setProduct_type_code('');
        setProduct_type_name('');
        setProduct_type_status('1');

        setShowFormModal(false);
    }

    const FormModalDeleteClose = () => {
        setProduct_type_id(0);

        setShowFormModalDelete(false);
    }

    const formSubmit = (e) => {
        e.preventDefault();

        const formData = {
            product_type_company: product_type_company,
            product_type_code: product_type_code,
            product_type_name: product_type_name,
            product_type_status: product_type_status
        }

        let axios;
        if(product_type_id > 0) {
            axios = apiUrl.put("/product-type/product-type-update/"+product_type_id,formData)
        } else {
            axios = apiUrl.post("/product-type/product-type-create/",formData)
        }
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                const axios = apiUrl.get("/product-type/product-type-list/?company="+company+"&status="+status+"&search="+search);
                axios.then((response) => {
                    const product_type_result_data = response.data;
                    if(product_type_result_data.status == 1){
                        setProduct_type_list(product_type_result_data.data);
                    } else {
                        setProduct_type_list([]);
                    }
                }).catch((e) => console.log(e));
                setTimeout(() => {
                    toast.success(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000
                    });
                }, 300);

                setProduct_type_id(0);
                setProduct_type_company('');
                setProduct_type_code('');
                setProduct_type_name('');
                setProduct_type_status('1');

                setShowFormModal(false);
            } else {
                setTimeout(() => {
                    toast.error(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000,
                    });
                }, 300);
            }
        }).catch((e) => console.log(e));
    }

    const formSubmitDelete = (delete_id) => {
        const axios = apiUrl.delete("/product-type/product-type-delete/"+delete_id,)
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                const deleteArray = product_type_list.filter((data) => data.product_type_id !== delete_id);
                setProduct_type_list(deleteArray);
                setTimeout(() => {
                    toast.success(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000
                    });
                }, 300);
                setProduct_type_id(0);
                setShowFormModalDelete(false);
            } else {
                setTimeout(() => {
                    toast.error(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000,
                    });
                }, 300);
            }
        }).catch((e) => console.log(e));
    }

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

    const product_typeData = () => {
        setOnProcess(true);
        const axios = apiUrl.get("/product-type/product-type-list/?company="+company+"&status="+status+"&search="+search);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setProduct_type_list(result_data.data);
                setOnProcess(false);
            } else {
                setProduct_type_list([]);
                setOnProcess(false);
            }
        }).catch((e) => console.log(e));
    }

    useEffect(() => {
        setUser_user_group(user_group);
        companyData();
        product_typeData();
    }, [company, status, search]);

    return (
        <Layout>
            <HeaderTitle title={lang.product_type} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.product_type}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.product_type}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center d-print-none">
                            {user_user_group == 1 || user_user_group == 2 || user_user_group == 3?
                            <button type="button" className="btn btn-success rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.new_product_type} onClick={() => formModal(0)}><i className="fal fa-plus"></i></button>
                            : ''}
                            <button type="button" className="btn btn-primary rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.print} onClick={() => window.print()}><i className="fal fa-print"></i></button>
                            <button type="button" className="btn btn-info rounded-pill pd-t-6-force pd-b-5-force" title={lang.excel_export} onClick={onDownload}><i className="fal fa-file-excel"></i></button>
                        </div>
                    </div>
                </div>
                {/* Breadcrumb End */}

                {/* Content Start */}
                <div className="row">
                    <div className="col-md-12 mg-b-15">
                        <div className="row clearfix mb-3 d-print-none">
                            <div className="col-md-4 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="search">{lang.search}</label>
                                    <input type="text" className="form-control bd-info" id="search" name="search" value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-4 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="company">{lang.company}</label>
                                    <select type="text" className="form-control bd-info" id="company" name="company" value={company} onChange={(e) => setCompany(e.target.value)}>
                                        <option value="">{lang.select}</option>
                                        {company_list.map(company_row => (
                                        <option key={company_row.company_id} value={company_row.company_id}>{company_row.company_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-4 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="status">{lang.status}</label>
                                    <select type="text" className="form-control bd-info" id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option value="all">All</option>
                                        {status_list.map(status_row => (
                                        <option key={status_row.status_id} value={status_row.status_id}>{status_row.status_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-striped table-bordered" ref={excelExportRef}>
                                <thead className="tx-12 tx-uppercase">
                                    <tr>
                                        <th className="tx-center">{lang.sn}</th>
                                        <th className="tx-center">{lang.type_code}</th>
                                        <th className="tx-center">{lang.type_name}</th>
                                        <th className="tx-center">{lang.status}</th>
                                        {user_user_group == 1 || user_user_group == 2 || user_user_group == 3 || user_user_group == 4 || user_user_group == 5?
                                        <th className="tx-center d-print-none">{lang.option}</th>
                                        :''}
                                    </tr>
                                </thead>
                                {onProcess ?
                                <tbody>
                                    <tr className=''>
                                        <th className="tx-center d-print-none" colSpan="11">
                                            <Image src="/assets/images/loading/loader.gif" alt="Loading" width={40} height={40} />
                                        </th>
                                    </tr>
                                </tbody>
                                :
                                <tbody>
                                    {product_type_list.map((row, index) => {
                                    return (
                                    <tr className='' key={row.product_type_id}>
                                        <td className="tx-center">{(index+1).toString().padStart(2, '0')}</td>
                                        <td className="tx-center">{row.product_type_code}</td>
                                        <td className="tx-left">{row.product_type_name}</td>
                                        <td className="tx-center">{row.product_type_status==1?lang.active:lang.inactive}</td>
                                        {user_user_group == 1 || user_user_group == 2 || user_user_group == 3 || user_user_group == 4 || user_user_group == 5?
                                        <td className="tx-center d-print-none">
                                            <Link className="text-primary mg-r-3" href="#" title={lang.edit} onClick={() => formModal(row.product_type_id)}><i className="fas fa-pencil wd-16 mr-2"></i></Link>
                                            {user_user_group == 1 ?
                                            <Link className="text-danger" href="#" title={lang.remove} onClick={() => formModalDelete(row.product_type_id)}><i className="fas fa-times wd-16 mr-2"></i></Link>
                                            :''}
                                        </td>
                                        :''}
                                    </tr>
                                    )})}
                                </tbody>
                                }
                            </table>
                        </div>
                    </div>
                </div>
                {/* Content End */}
            </div>
            {/* Form Modal Start*/}
            <div className={`modal fade zoomIn ${showFormModal ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-primary m-0 p-2">
                            <h6 className="modal-title text-white">{product_type_id == 0 ? lang.new : lang.update} {lang.product_type}</h6>
                            <button type="button" className="btn-close" onClick={() => FormModalClose()}></button>
                        </div>
                        <form onSubmit={(e) => formSubmit(e)} >
                            <div className="modal-body m-0 pl-3 pr-3 pt-0">
                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="product_type_company">{lang.company}</label>
                                            <select type="text" className="form-control border border-danger" id="product_type_company" name="product_type_company" value={product_type_company} onChange={(e) => setProduct_type_company(e.target.value)} required>
                                                <option value="">{lang.select}</option>
                                                {company_list.map(company_row => (
                                                <option key={company_row.company_id} value={company_row.company_id}>{company_row.company_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="product_type_code">{lang.type_code}</label>
                                            <input type="text" className="form-control bd-danger" id="product_type_code" name="product_type_code" value={product_type_code} onChange={(e) => setProduct_type_code(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="product_type_name">{lang.type_name}</label>
                                            <input type="text" className="form-control bd-danger" id="product_type_name" name="product_type_name" value={product_type_name} onChange={(e) => setProduct_type_name(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="product_type_status">{lang.status}</label>
                                            <select type="text" className="form-control border border-danger" id="product_type_status" name="product_type_status" value={product_type_status} onChange={(e) => setProduct_type_status(e.target.value)}>
                                                {status_list.map(status_row => (
                                                <option key={status_row.status_id} value={status_row.status_id}>{status_row.status_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top p-2">
                                <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => FormModalClose()}><i className="fal fa-times-circle"></i> {lang.close}</button>
                                <button type="submit" className="btn btn-sm btn-success rounded-pill text-uppercase pd-t-6-force pd-b-5-force"><i className="fal fa-check-circle"></i> {lang.save}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Form Modal End*/}

            {/* Form Modal Delete Start*/}
            <div className={`modal fade ${showFormModalDelete ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-md">
                    <div className="modal-content">
                        <div className="modal-header bg-primary m-0 p-2">
                            <h6 className="modal-title text-white">{lang.delete} {lang.product_type}</h6>
                            <button type="button" className="btn-close" onClick={() => FormModalDeleteClose()}></button>
                        </div>

                        <div className="modal-body m-0 pl-3 pr-3 pt-0">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="tx-center tx-50 tx-warning">
                                        <i className="fal fa-exclamation-circle"></i>
                                    </div>
                                    <h4 className="tx-danger tx-uppercase tx-13 tx-center">{lang.data_delete_warning}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-top p-2">
                            <button type="submit" className="btn btn-sm btn-success rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => formSubmitDelete(product_type_id)}><i className="fal fa-check-circle"></i> {lang.yes}</button>
                            <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => FormModalDeleteClose()}><i className="fal fa-times-circle"></i> {lang.no}</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Form Modal Delete End*/}
            <ToastContainer />
        </Layout>
    )
}

export default  ProductType;