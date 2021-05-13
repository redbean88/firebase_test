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
 * 계좌조회 API 연계 모듈 초기화
 */
const easyFinBankService = popbill.EasyFinBankService();

// API List Index
router.get("/", function(req, res, next) {
  res.render("EasyFinBank/index", {});
});

/*
 * 팝빌 계좌 관리 팝업 URL을 확인합니다.
 * - 보안정책에 따라 반환된 URL은 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/easyfinbank/node/api#GetBankAccountMgtURL
 */
router.get("/getBankAccountMgtURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  easyFinBankService.getBankAccountMgtURL(testCorpNum,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});


/*
 * 계좌를 등록합니다.
 */
router.get("/registBankAccount", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 계좌정보
  const bankAccountInfo = {

    // [필수] 은행코드
    // 산업은행-0002 / 기업은행-0003 / 국민은행-0004 /수협은행-0007 / 농협은행-0011 / 우리은행-0020
    // SC은행-0023 / 대구은행-0031 / 부산은행-0032 / 광주은행-0034 / 제주은행-0035 / 전북은행-0037
    // 경남은행-0039 / 새마을금고-0045 / 신협은행-0048 / 우체국-0071 / KEB하나은행-0081 / 신한은행-0088 /씨티은행-0027
    BankCode: "",

    // [필수] 계좌번호, 하이픈('-') 제외
    AccountNumber: "",

    // [필수] 계좌비밀번호
    AccountPWD: "",

    // [필수] 계좌유형, "법인" 또는 "개인" 입력
    AccountType: "",

    // [필수] 예금주 식별정보 (‘-‘ 제외)
    // 계좌유형이 “법인”인 경우 : 사업자번호(10자리)
    // 계좌유형이 “개인”인 경우 : 예금주 생년월일 (6자리-YYMMDD)
    IdentityNumber: "",

    // 계좌 별칭
    AccountName: "",

    // 인터넷뱅킹 아이디 (국민은행 필수)
    BankID: "",

    // 조회전용 계정 아이디 (대구은행, 신협, 신한은행 필수)
    FastID: "",

    // 조회전용 계정 비밀번호 (대구은행, 신협, 신한은행 필수
    FastPWD: "",

    // 결제기간(개월), 1~12 입력가능, 미기재시 기본값(1) 처리
    // - 파트너 과금방식의 경우 입력값에 관계없이 1개월 처리
    UsePeriod: "1",

    // 메모
    Memo: "",
  };

  easyFinBankService.registBankAccount(testCorpNum, bankAccountInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌에 등록된 계좌정보를 수정합니다.
 */
router.get("/updateBankAccount", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 계좌정보
  const bankAccountInfo = {

    // [필수] 은행코드
    // 산업은행-0002 / 기업은행-0003 / 국민은행-0004 /수협은행-0007 / 농협은행-0011 / 우리은행-0020
    // SC은행-0023 / 대구은행-0031 / 부산은행-0032 / 광주은행-0034 / 제주은행-0035 / 전북은행-0037
    // 경남은행-0039 / 새마을금고-0045 / 신협은행-0048 / 우체국-0071 / KEB하나은행-0081 / 신한은행-0088 /씨티은행-0027
    BankCode: "",

    // [필수] 계좌번호, 하이픈('-') 제외
    AccountNumber: "",

    // [필수] 계좌비밀번호
    AccountPWD: "",

    // 계좌 별칭
    AccountName: "",

    // 인터넷뱅킹 아이디 (국민은행 필수)
    BankID: "",

    // 조회전용 계정 아이디 (대구은행, 신협, 신한은행 필수)
    FastID: "",

    // 조회전용 계정 비밀번호 (대구은행, 신협, 신한은행 필수
    FastPWD: "",

    // 메모
    Memo: "",
  };

  easyFinBankService.updateBankAccount(testCorpNum, bankAccountInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
* 팝빌에 등록된 은행계좌의 정액제 해지를 요청한다.
*/
router.get("/closeBankAccount", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 은행코드
  // 산업은행-0002 / 기업은행-0003 / 국민은행-0004 /수협은행-0007 / 농협은행-0011 / 우리은행-0020
  // SC은행-0023 / 대구은행-0031 / 부산은행-0032 / 광주은행-0034 / 제주은행-0035 / 전북은행-0037
  // 경남은행-0039 / 새마을금고-0045 / 신협은행-0048 / 우체국-0071 / KEB하나은행-0081 / 신한은행-0088 /씨티은행-0027
  const bankCode = "";

  // 계좌번호, 하이픈('-') 제외
  const accountNumber = "";

  // 해지유형, "일반", "중도" 중 선택기재
  // 일반해지 - 이용중인 정액제 사용기간까지 이용후 정지
  // 중도해지 - 요청일 기준으로 정지, 정액제 잔여기간은 일할로 계산되어 포인트 환불
  const closeType = "중도";

  easyFinBankService.closeBankAccount(testCorpNum, bankCode, accountNumber, closeType,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
* 계좌의 정액제 해지신청을 취소합니다.
*/
router.get("/revokeCloseBankAccount", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 은행코드
  // 산업은행-0002 / 기업은행-0003 / 국민은행-0004 /수협은행-0007 / 농협은행-0011 / 우리은행-0020
  // SC은행-0023 / 대구은행-0031 / 부산은행-0032 / 광주은행-0034 / 제주은행-0035 / 전북은행-0037
  // 경남은행-0039 / 새마을금고-0045 / 신협은행-0048 / 우체국-0071 / KEB하나은행-0081 / 신한은행-0088 /씨티은행-0027
  const bankCode = "";

  // 계좌번호, 하이픈('-') 제외
  const accountNumber = "";

  easyFinBankService.revokeCloseBankAccount(testCorpNum, bankCode, accountNumber,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
* 팝빌에 등록된 은행계좌를 삭제 합니다.
* 종량제를 이용시 사용, 정액제 이용시 사용 불가.
*/
router.get("/deleteBankAccount", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 은행코드
  // 산업은행-0002 / 기업은행-0003 / 국민은행-0004 /수협은행-0007 / 농협은행-0011 / 우리은행-0020
  // SC은행-0023 / 대구은행-0031 / 부산은행-0032 / 광주은행-0034 / 제주은행-0035 / 전북은행-0037
  // 경남은행-0039 / 새마을금고-0045 / 신협은행-0048 / 우체국-0071 / KEB하나은행-0081 / 신한은행-0088 /씨티은행-0027
  const bankCode = "";

  // 계좌번호, 하이픈('-') 제외
  const accountNumber = "";

  easyFinBankService.deleteBankAccount(testCorpNum, bankCode, accountNumber,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 계좌정보를 확인합니다.
 */
router.get("/getBankAccountInfo", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 은행코드
  // 산업은행-0002 / 기업은행-0003 / 국민은행-0004 /수협은행-0007 / 농협은행-0011 / 우리은행-0020
  // SC은행-0023 / 대구은행-0031 / 부산은행-0032 / 광주은행-0034 / 제주은행-0035 / 전북은행-0037
  // 경남은행-0039 / 새마을금고-0045 / 신협은행-0048 / 우체국-0071 / KEB하나은행-0081 / 신한은행-0088 /씨티은행-0027
  const bankCode = "";

  // 계좌번호, 하이픈('-') 제외
  const accountNumber = "";

  easyFinBankService.getBankAccountInfo(testCorpNum, bankCode, accountNumber,
      function(result) {
        res.render("EasyFinBank/getBankAccountInfo", {path: req.path, info: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});


/*
 * 팝빌에 등록된 은행 계좌 목록을 확인합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#ListBankAccount
 */
router.get("/listBankAccount", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  easyFinBankService.listBankAccount(testCorpNum,
      function(response) {
        res.render("EasyFinBank/listBankAccount", {path: req.path, result: response});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌에 등록된 계좌의 거래내역 수집을 요청합니다.
 * - 수집 요청후 반환받은 작업아이디(JobID)의 유효시간은 1시간 입니다.
 * - https://docs.popbill.com/easyfinbank/node/api#RequestJob
 */
router.get("/requestJob", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 은행코드
  const bankCode = "0039";

  // 계좌번호,  하이픈('-') 제외
  const accountNumber = "2070064402404";

  // 시작일자, 날짜형식(yyyyMMdd)
  const SDate = "20200701";

  // 종료일자, 날짜형식(yyyyMMdd)
  const EDate = "20200724";

  easyFinBankService.requestJob(testCorpNum, bankCode, accountNumber, SDate, EDate,
      function(jobID) {
        res.render("result", {path: req.path, result: jobID});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 수집 요청 상태를 확인합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#GetJobState
 */
router.get("/getJobState", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 작업아이디
  const jobID = "019123110000000001";

  easyFinBankService.getJobState(testCorpNum, jobID,
      function(response) {
        res.render("EasyFinBank/jobState", {path: req.path, result: response});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});


/*
 * 정액제 신청 팝업 URL을 반환합니다.
 * - 보안정책에 따라 반환된 URL은 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/easyfinbank/node/api#GetFlatRatePopUpURL
 */
router.get("/getFlatRatePopUpURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  easyFinBankService.getFlatRatePopUpURL(testCorpNum,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 수집 요청건들에 대한 상태 목록을 확인합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#ListActiveJob
 */
router.get("/listActiveJob", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  easyFinBankService.listActiveJob(testCorpNum,
      function(response) {
        res.render("EasyFinBank/listActiveJob", {path: req.path, result: response});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 수집이 완료된 거래내역을 조회합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#Search
 */
router.get("/search", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "";

  // 작업아이디
  const jobID = "020072414000000001";

  // 거래유형 배열, I-입금 / O-출금
  const tradeType = ["I", "O"];

  // 조회 검색어, 입금/출금액, 메모, 적요 like 검색
  const searchString = "";

  // 페이지번호
  const page = 1;

  // 페이지당 검색개수
  const perPage = 10;

  // 정렬방향, D-내림차순, A-오름차순
  const order = "D";

  easyFinBankService.search(testCorpNum, jobID, tradeType, searchString, page, perPage, order, testUserID,
      function(response) {
        res.render("EasyFinBank/search", {path: req.path, result: response});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 수집이 완료된 거래내역 요약정보를 조회합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#Summary
 */
router.get("/summary", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "";

  // 작업아이디
  const jobID = "019123110000000004";

  // 거래유형 배열, I-입금 / O-출금
  const tradeType = ["I", "O"];

  // 조회 검색어, 입금/출금액, 메모, 적요 like 검색
  const searchString = "";

  easyFinBankService.summary(testCorpNum, jobID, tradeType, searchString, testUserID,
      function(response) {
        res.render("EasyFinBank/summary", {path: req.path, result: response});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 한 건의 거래내역에 메모를 저장합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#SaveMemo
 */
router.get("/saveMemo", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 거래내역 아이디, Search API 응답 list tid 항목 확인.
  const tid = "01912181100000000120191231000001";

  // 메모
  const memo = "memo-nodejs";

  easyFinBankService.saveMemo(testCorpNum, tid, memo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 정액제 서비스 상태를 확인합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#GetFlatRateState
 */
router.get("/getFlatRateState", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 은행코드
  const bankCode = "0048";

  // 계좌번호, 하이픈('-') 제외
  const accountNumber = "131020538645";

  easyFinBankService.getFlatRateState(testCorpNum, bankCode, accountNumber,
      function(response) {
        res.render("EasyFinBank/flatRateState", {path: req.path, result: response});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 잔여포인트를 확인합니다.
 * - 과금방식이 파트너과금인 경우 파트너 잔여포인트(GetPartnerBalance API) 를 통해 확인하시기 바랍니다.
 * - https://docs.popbill.com/easyfinbank/node/api#GetBalance
 */
router.get("/getBalance", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  easyFinBankService.getBalance(testCorpNum,
      function(remainPoint) {
        res.render("result", {path: req.path, result: remainPoint});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌 연동회원 포인트 충전 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/easyfinbank/node/api#GetChargeURL
 */
router.get("/getChargeURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "testkorea";

  easyFinBankService.getChargeURL(testCorpNum, testUserID,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 파트너의 잔여포인트를 확인합니다.
 * - 과금방식이 연동과금인 경우 연동회원 잔여포인트(GetBalance API)를 이용하시기 바랍니다.
 * - https://docs.popbill.com/easyfinbank/node/api#GetPartnerBalance
 */
router.get("/getPartnerBalance", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  easyFinBankService.getPartnerBalance(testCorpNum,
      function(remainPoint) {
        res.render("result", {path: req.path, result: remainPoint});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});


/*
 * 파트너 포인트 충전 팝업 URL을 반환합니다.
 * - 보안정책에 따라 반환된 URL은 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/easyfinbank/node/api#GetPartnerURL
 */
router.get("/getPartnerURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // CHRG(포인트충전)
  const TOGO = "CHRG";

  easyFinBankService.getPartnerURL(testCorpNum, TOGO,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 계좌조회 API 서비스 과금정보를 확인합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#GetChargeInfo
 */
router.get("/getChargeInfo", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  easyFinBankService.getChargeInfo(testCorpNum,
      function(result) {
        res.render("Base/getChargeInfo", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});


/*
 * 해당 사업자의 파트너 연동회원 가입여부를 확인합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#CheckIsMember
 */
router.get("/checkIsMember", function(req, res, next) {
  // 조회할 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  easyFinBankService.checkIsMember(testCorpNum,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌 회원아이디 중복여부를 확인합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#CheckID
 */
router.get("/checkID", function(req, res, next) {
  // 조회할 아이디
  const testID = "testkorea";

  easyFinBankService.checkID(testID,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌 연동회원 가입을 요청합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#JoinMember
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

  easyFinBankService.joinMember(joinInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌(www.popbill.com)에 로그인된 팝빌 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/easyfinbank/node/api#GetAccessURL
 */
router.get("/getAccessURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "testkorea";

  easyFinBankService.getAccessURL(testCorpNum, testUserID,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 담당자를 신규로 등록합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#RegistContact
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

  easyFinBankService.registContact(testCorpNum, contactInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 담당자 목록을 확인합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#ListContact
 */
router.get("/listContact", function(req, res, next) {
  // 조회할 아이디
  const testCorpNum = "1234567890";

  easyFinBankService.listContact(testCorpNum,
      function(result) {
        res.render("Base/listContact", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 담당자 정보를 수정합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#UpdateContact
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

  easyFinBankService.updateContact(testCorpNum, testUserID, contactInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 회사정보를 확인합니다.
 * - https://docs.popbill.com/easyfinbank/node/api#GetCorpInfo
 */
router.get("/getCorpInfo", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  easyFinBankService.getCorpInfo(testCorpNum,
      function(result) {
        res.render("Base/getCorpInfo", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 회사정보를 수정합니다
 * - https://docs.popbill.com/easyfinbank/node/api#UpdateCorpInfo
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

  easyFinBankService.updateCorpInfo(testCorpNum, corpInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});


module.exports = router;
