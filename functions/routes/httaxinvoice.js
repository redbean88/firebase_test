const express = require("express");
const router = express.Router();
const popbill = require("popbill");


/*
 * 팝빌 서비스 연동환경 초기화
 */
popbill.config({

  // 링크아이디
  LinkID: "TESTER",

  // 비밀키
  SecretKey: "SwWxqU+0TErBXy/9TVjIPEnI0VTUMMSQZtJf3Ed8q3I=",

  // 연동환경 설정값, 개발용(true), 상업용(false)
  IsTest: true,

  // 인증토큰 IP제한기능 사용여부, 권장(true)
  IPRestrictOnOff: true,

  // 인증토큰정보 로컬서버 시간 사용여부
  UseLocalTimeYN: true,

  // 팝빌 API 서비스 고정 IP 사용여부(GA)
  UseStaticIP: false,

  // 로컬서버 시간 사용여부 true-사용(기본값-권장), false-미사용
  UseLocalTimeYN: true,

  defaultErrorHandler: function(Error) {
    console.log("Error Occur : [" + Error.code + "] " + Error.message);
  },
});


/*
 * 홈택스 전자세금계산서 API 연계 모듈 초기화
 */
const htTaxinvoiceService = popbill.HTTaxinvoiceService();

// API List Index
router.get("/", function(req, res, next) {
  res.render("HTTaxinvoice/index", {});
});

/*
 * 전자세금계산서 매출/매입 내역 수집을 요청합니다
 * - https://docs.popbill.com/httaxinvoice/node/api#RequestJob
 */
router.get("/requestJob", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 세금계산서 유형, SELL-매출, BUY-매입, TRUSTEE-수탁
  const type = popbill.MgtKeyType.SELL;

  // 검색일자유형, W-작성일자, I-발행일자, S-전송일자
  const DType = "S";

  // 시작일자, 날짜형식(yyyyMMdd)
  const SDate = "20190901";

  // 종료일자, 날짜형식(yyyyMMdd)
  const EDate = "20191231";

  htTaxinvoiceService.requestJob(testCorpNum, type, DType, SDate, EDate,
      function(jobID) {
        res.render("result", {path: req.path, result: jobID});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 수집 요청 상태를 확인합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetJobState
 */
router.get("/getJobState", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 작업아이디
  const jobID = "019121721000000002";

  htTaxinvoiceService.getJobState(testCorpNum, jobID,
      function(response) {
        res.render("HomeTax/jobState", {path: req.path, result: response});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 수집 요청건들에 대한 상태 목록을 확인합니다.
 * - 수집 요청 작업아이디(JobID)의 유효시간은 1시간 입니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#ListActiveJob
 */
router.get("/listActiveJob", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.listActiveJob(testCorpNum,
      function(response) {
        res.render("HomeTax/listActiveJob", {path: req.path, result: response});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자세금계산서 매입/매출 내역의 수집 결과를 조회합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#Search
 */
router.get("/search", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "";

  // 작업아이디
  const jobID = "019121721000000002";

  // 문서형태 배열, N-일반 세금계산서, M-수정세금계산서
  const type = ["N", "M"];

  // 과세형태 배열, T-과세, N-면세, Z-영세
  const taxType = ["T", "N", "Z"];

  // 영수/청구 배열, R-영수, C-청구, N-없음
  const purposeType = ["R", "C", "N"];


  // 종사업장 사업자유형, S-공급자, B-공급받는자, T-수탁자
  const taxRegIDType = "S";

  // 종사업장번호 유무, 공백-전체조회, 0-종사업장번호 없음, 1-종사업장번호 있음
  const taxRegIDYN = "";

  // 종사업장번호, 콤마(',')로 구분하여 구성, ex) '1234,0007';
  const taxRegID = "";


  // 페이지번호
  const page = 1;

  // 페이지당 검색개수
  const perPage = 10;

  // 정렬방향, D-내림차순, A-오름차순
  const order = "D";

  // 조회 검색어, 거래처 사업자번호 또는 거래처명 like 검색
  const searchString = "";

  htTaxinvoiceService.search(testCorpNum, jobID, type, taxType, purposeType, taxRegIDType,
      taxRegIDYN, taxRegID, page, perPage, order, testUserID, searchString,
      function(response) {
        res.render("HTTaxinvoice/search", {path: req.path, result: response});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자세금계산서 매입/매출 내역의 수집 결과 요약정보를 조회합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#Summary
 */
router.get("/summary", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "";

  // 작업아이디
  const jobID = "019103109000000121";

  // 문서형태 배열, N-일반 세금계산서, M-수정세금계산서
  const type = ["N", "M"];

  // 과세형태 배열, T-과세, N-면세, Z-영세
  const taxType = ["T", "N", "Z"];

  // 영수/청구 배열, R-영수, C-청구, N-없음
  const purposeType = ["R", "C", "N"];

  // 종사업장 사업자유형, S-공급자, B-공급받는자, T-수탁자
  const taxRegIDType = "S";

  const taxRegIDYN = "";

  // 종사업장번호, 콤마(',')로 구분하여 구성, ex) '1234,0007';
  const taxRegID = "";

  // 조회 검색어, 거래처 사업자번호 또는 거래처명 like 검색
  const searchString = "";

  htTaxinvoiceService.summary(testCorpNum, jobID, type, taxType, purposeType,
      taxRegIDType, taxRegIDYN, taxRegID, testUserID, searchString,
      function(response) {
        res.render("HTTaxinvoice/summary", {path: req.path, result: response});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자세금계산서 1건의 상세정보를 확인합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetTaxinvoice
 */
router.get("/getTaxinvoice", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 전자세금계산서 국세청 승인번호
  const ntsconfirmNum = "201901074100020300000ecd";

  htTaxinvoiceService.getTaxinvoice(testCorpNum, ntsconfirmNum,
      function(response) {
        res.render("HTTaxinvoice/getTaxinvoice", {path: req.path, result: response});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * XML 형식의 전자세금계산서 상세정보를 확인합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetXML
 */
router.get("/getXML", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 전자세금계산서 국세청 승인번호
  const ntsconfirmNum = "201901074100020300000ecd";

  htTaxinvoiceService.getXML(testCorpNum, ntsconfirmNum,
      function(response) {
        res.render("HTTaxinvoice/getXML", {path: req.path, result: response});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 홈택스 전자세금계산서 보기 팝업 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetPopUpURL
 */
router.get("/getPopUpURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 국세청승인번호
  const NTSConfirmNum = "201901074100020300000ecd";

  htTaxinvoiceService.getPopUpURL(testCorpNum, NTSConfirmNum,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 홈택스 전자세금계산서 인쇄 팝업 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetPrintURL
 */
router.get("/getPrintURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 국세청승인번호
  const NTSConfirmNum = "201901074100020300000ecd";

  htTaxinvoiceService.getPrintURL(testCorpNum, NTSConfirmNum,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 홈택스연동 인증관리를 위한 URL을 반환합니다.
 * - 인증방식에는 부서사용자/공인인증서 인증 방식이 있습니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetCertificatePopUpURL
 */
router.get("/getCertificatePopUpURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.getCertificatePopUpURL(testCorpNum,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌에 등록된 홈택스 공인인증서의 만료일자를 반환합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetCertificateExpireDate
 */
router.get("/getCertificateExpireDate", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.getCertificateExpireDate(testCorpNum,
      function(expireDate) {
        res.render("result", {path: req.path, result: expireDate});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌에 등록된 공인인증서의 홈택스 로그인을 테스트합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#CheckCertValidation
 */
router.get("/checkCertValidation", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.checkCertValidation(testCorpNum,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 홈택스 전자세금계산서 부서사용자 계정을 팝빌에 등록합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#RegistDeptUser
 */
router.get("/registDeptUser", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 홈택스에서 생성한 전자세금계산서 부서사용자 아이디
  const deptUserID = "userid";

  // 홈택스에서 생성한 전자세금계산서 부서사용자 비밀번호
  const deptUserPWD = "passwd";


  htTaxinvoiceService.registDeptUser(testCorpNum, deptUserID, deptUserPWD,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌에 등록된 부서사용자 아이디를 확인합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#CheckDeptUser
 */
router.get("/checkDeptUser", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.checkDeptUser(testCorpNum,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌에 등록된 부서사용자 계정정보를 이용하여 홈택스 로그인을 테스트합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#CheckLoginDeptUser
 */
router.get("/checkLoginDeptUser", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.checkLoginDeptUser(testCorpNum,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌에 등록된 부서사용자 계정정보를 삭제합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#DeleteDeptUser
 */
router.get("/deleteDeptUser", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.deleteDeptUser(testCorpNum,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 잔여포인트를 확인합니다.
 * - 과금방식이 파트너과금인 경우 파트너 잔여포인트(GetPartnerBalance API) 를 통해 확인하시기 바랍니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetBalance
 */
router.get("/getBalance", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.getBalance(testCorpNum,
      function(remainPoint) {
        res.render("result", {path: req.path, result: remainPoint});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌 연동회원 포인트 충전 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetChargeURL
 */
router.get("/getChargeURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "testkorea";

  htTaxinvoiceService.getChargeURL(testCorpNum, testUserID,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 파트너의 잔여포인트를 확인합니다.
 * - 과금방식이 연동과금인 경우 연동회원 잔여포인트(GetBalance API)를 이용하시기 바랍니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetPartnerBalance
 */
router.get("/getPartnerBalance", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.getPartnerBalance(testCorpNum,
      function(remainPoint) {
        res.render("result", {path: req.path, result: remainPoint});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 파트너 포인트 충전 팝업 URL을 반환합니다.
 * - 보안정책에 따라 반환된 URL은 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetPartnerURL
 */
router.get("/getPartnerURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // CHRG(포인트충전)
  const TOGO = "CHRG";

  htTaxinvoiceService.getPartnerURL(testCorpNum, TOGO,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 홈택스 전자세금계산서 연계 API 서비스 과금정보를 확인합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetChargeInfo
 */
router.get("/getChargeInfo", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.getChargeInfo(testCorpNum,
      function(result) {
        res.render("Base/getChargeInfo", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 정액제 신청 팝업 URL을 반환합니다.
 * - 보안정책에 따라 반환된 URL은 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetFlatRatePopUpURL
 */
router.get("/getFlatRatePopUpURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.getFlatRatePopUpURL(testCorpNum,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 정액제 서비스 상태를 확인합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetFlatRateState
 */
router.get("/getFlatRateState", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.getFlatRateState(testCorpNum,
      function(response) {
        res.render("HomeTax/flatRateState", {path: req.path, result: response});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 해당 사업자의 파트너 연동회원 가입여부를 확인합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#CheckIsMember
 */
router.get("/checkIsMember", function(req, res, next) {
  // 조회할 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.checkIsMember(testCorpNum,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌 회원아이디 중복여부를 확인합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#CheckID
 */
router.get("/checkID", function(req, res, next) {
  // 조회할 아이디
  const testID = "testkorea";

  htTaxinvoiceService.checkID(testID,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌 연동회원 가입을 요청합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#JoinMember
 */
router.get("/joinMember", function(req, res, next) {
  // 회원정보
  const joinInfo = {

    // 회원 아이디 (6자 이상 50자 미만)
    ID: "userid",

    // 회원 비밀번호 (6자 이상 20자 미만)
    PWD: "this_is_password",

    // 링크아이디
    LinkID: "TESTER",

    // 사업자번호, '-' 제외 10자리
    CorpNum: "1234567890",

    // 대표자명 (최대 100자)
    CEOName: "대표자성명",

    // 상호 (최대 200자)
    CorpName: "테스트상호",

    // 주소 (최대 300자)
    Addr: "주소",

    // 업태 (최대 100자)
    BizType: "업태",

    // 종목 (최대 100자)
    BizClass: "업종",

    // 담당자 성명 (최대 100자)
    ContactName: "담당자 성명",

    // 담당자 이메일 (최대 20자)
    ContactEmail: "test@test.com",

    // 담당자 연락처 (최대 20자)
    ContactTEL: "070-4304-2991",

    // 담당자 휴대폰번호 (최대 20자)
    ContactHP: "010-1234-1234",

  };

  htTaxinvoiceService.joinMember(joinInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌(www.popbill.com)에 로그인된 팝빌 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetAccessURL
 */
router.get("/getAccessURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "testkorea";

  htTaxinvoiceService.getAccessURL(testCorpNum, testUserID,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 담당자를 신규로 등록합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#RegistContact
 */
router.get("/registContact", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 담당자 정보
  const contactInfo = {

    // 아이디 (6자 이상 50자 미만)
    id: "testkorea03033",

    // 비밀번호 (6자 이상 20자 미만)
    pwd: "thisispassword",

    // 담당자명 (최대 100자)
    personName: "담당자명0309",

    // 연락처 (최대 20자)
    tel: "070-4304-2991",

    // 휴대폰번호 (최대 20자)
    hp: "010-1234-1234",

    // 팩스번호 (최대 20자)
    fax: "070-4304-2991",

    // 이메일 (최대 100자)
    email: "test@test.co.kr",

    // 전체조회여부, 회사조회(true), 개인조회(false)
    searchAllAllowYN: true,

  };

  htTaxinvoiceService.registContact(testCorpNum, contactInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 담당자 목록을 확인합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#ListContact
 */
router.get("/listContact", function(req, res, next) {
  // 조회할 아이디
  const testCorpNum = "1234567890";

  htTaxinvoiceService.listContact(testCorpNum,
      function(result) {
        res.render("Base/listContact", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 담당자 정보를 수정합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#UpdateContact
 */
router.get("/updateContact", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "testkorea";

  // 담당자 정보 항목
  const contactInfo = {

    // 담당자 아이디
    id: testUserID,

    // 담당자명 (최대 100자)
    personName: "담당자명0309",

    // 연락처 (최대 20자)
    tel: "070-4304-2991",

    // 휴대폰번호 (최대 20자)
    hp: "010-1234-1234",

    // 팩스번호 (최대 20자)
    fax: "070-4304-2991",

    // 이메일 (최대 100자)
    email: "test@test.co.kr",

    // 전체조회여부, 회사조회(true), 개인조회(false)
    searchAllAllowYN: true,

  };

  htTaxinvoiceService.updateContact(testCorpNum, testUserID, contactInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 회사정보를 확인합니다.
 * - https://docs.popbill.com/httaxinvoice/node/api#GetCorpInfo
 */
router.get("/getCorpInfo", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  htTaxinvoiceService.getCorpInfo(testCorpNum,
      function(result) {
        res.render("Base/getCorpInfo", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 회사정보를 수정합니다
 * - https://docs.popbill.com/httaxinvoice/node/api#UpdateCorpInfo
 */
router.get("/updateCorpInfo", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 회사정보
  const corpInfo = {

    // 대표자명 (최대 100자)
    ceoname: "대표자성명_nodejs",

    // 상호 (최대 200자)
    corpName: "업체명_nodejs",

    // 주소 (최대 300자)
    addr: "서구 천변좌로_nodejs",

    // 업태 (최대 100자)
    bizType: "업태_nodejs",

    // 종목 (최대 100자)
    bizClass: "종목_nodejs",

  };

  htTaxinvoiceService.updateCorpInfo(testCorpNum, corpInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

module.exports = router;
