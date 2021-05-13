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
 * 전자명세서 API 서비스 클래스 생성
 */
const statementService = popbill.StatementService();

/*
 * Statement API Index 목록
 */
router.get("/", function(req, res, next) {
  res.render("Statement/index", {});
});

/*
 * 전자명세서 문서번호 중복여부를 확인합니다.
 * - 문서번호는 1~24자리로 숫자, 영문 '-', '_' 조합으로 구성할 수 있습니다.
 * - https://docs.popbill.com/statement/node/api#CheckMgtKeyInUse
 */
router.get("/checkMgtKeyInUse", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  statementService.checkMgtKeyInUse(testCorpNum, itemCode, mgtKey,
      function(result) {
        if (result) {
          res.render("result", {path: req.path, result: "사용중"});
        } else {
          res.render("result", {path: req.path, result: "미사용중"});
        }
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 1건의 전자명세서를 즉시발행 처리합니다.
 * - https://docs.popbill.com/statement/node/api#RegistIssue
 */
router.get("/registIssue", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "testkorea";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const ItemCode = 121;

  // 문서번호, 1~24자리 영문, 숫자, '-', '_' 조합으로 구성, 사업자별로 중복되지 않도록 생성
  const MgtKey = "20191031-005";

  // 메모
  const memo = "";

  // 안내메일 제목, 미기재시 기본양식으로 전송.
  const emailSubject = "";

  // 전자명세서 정보
  const statement = {

    // [필수] 기재상 작성일자, 날짜형식(yyyyMMdd)
    writeDate: "20191031",

    // [필수] 영수, 청구 중 기재
    purposeType: "영수",

    // [필수] 과세형태, 과세, 영세, 면세 중 기재
    taxType: "과세",

    // 맞춤양식코드, 미기재시 기본양식으로 작성
    formCode: "",

    // [필수] 명세서 코드
    itemCode: ItemCode,

    // [필수] 문서번호
    mgtKey: MgtKey,

    /** ***********************************************************************
         *                             발신자 정보
         **************************************************************************/

    // 발신자 사업자번호
    senderCorpNum: testCorpNum,

    // 발신자 상호
    senderCorpName: "발신자 상호",

    // 발신자 주소
    senderAddr: "발신자 주소",

    // 발신자 대표자 성명
    senderCEOName: "발신자 대표자 성명",

    // 종사업장 식별번호, 필요시기재, 형식은 숫자 4자리
    senderTaxRegID: "",

    // 발신자 종목
    senderBizClass: "종목",

    // 발신자 업태
    senderBizType: "업태",

    // 발신자 담당자명
    senderContactName: "담당자명",

    // 발신자 메일주소
    senderEmail: "test@test.com",

    // 발신자 연락처
    senderTEL: "070-4304-2991",

    // 발신자 휴대폰번호
    senderHP: "000-111-222",

    /** ***********************************************************************
         *                             수신자 정보
         **************************************************************************/

    // 수신자 사업자번호
    receiverCorpNum: "8888888888",

    // 수신자 상호
    receiverCorpName: "수신자상호",

    // 수신자 대표자 성명
    receiverCEOName: "수신자 대표자 성명",

    // 수신자 주소
    receiverAddr: "수신자 주소",

    // 수신자 종사업장 식별번호, 필요시 기재
    recieverTaxRegID: "",

    // 수신자 종목
    receiverBizClass: "종목",

    // 수신자 업태
    receiverBizType: "업태",

    // 수신자 담당자명
    receiverContactName: "수신자 담당자 성명",

    // 수신자 메일주소
    // 팝빌 개발환경에서 테스트하는 경우에도 안내 메일이 전송되므로,
    // 실제 거래처의 메일주소가 기재되지 않도록 주의
    receiverEmail: "test@test.com",

    // 수신자 연락처
    receiverTEL: "070-1111-2222",

    // 수신자 휴대폰 번호
    receiverHP: "000111222",

    /** ***********************************************************************
         *                            전자명세서 기재정보
         **************************************************************************/

    // [필수] 공급가액 합계
    supplyCostTotal: "20000",

    // [필수] 세액 합계
    taxTotal: "2000",

    // [필수] 합계금액 (공급가액 합계+ 세액 합계)
    totalAmount: "22000",

    // 기재 상 '일련번호' 항목
    serialNum: "1",

    // 기재 상 '비고' 항목
    remark1: "비고1",
    remark2: "비고2",
    remark3: "비고3",

    // 사업자등록증 이미지 첨부 여부
    businessLicenseYN: false,

    // 통장사본 이미지 첨부 여부
    bankBookYN: false,


    /** ***********************************************************************
         *                          상세9항목(품목) 정보
         **************************************************************************/

    detailList: [
      {
        serialNum: 1, // 품목 일련번호 1부터 순차기재
        itemName: "품명",
        purchaseDT: "20190917", // 구매일자
        qty: "1", // 수량
        unitCost: "10000", // 단가
        spec: "규격", // 규격
        supplyCost: "10000", // 공급가액
        tax: "1000", // 세액
        remark: "비고",
      },
      {
        serialNum: 2, // 품목 일련번호 1부터 순차기재
        itemName: "품명2",
        purchaseDT: "20190917", // 구매일자
        qty: "1", // 수량
        unitCost: "10000", // 단가
        spec: "규격", // 규격
        supplyCost: "10000", // 공급가액
        tax: "1000", // 세액
        remark: "비고",
      },
    ],


    /** ***********************************************************************
         *                               전자명세서 추가속성
         * - 추가속성에 관한 자세한 사항은 "[전자명세서 API 연동매뉴얼] >
         *   5.2. 기본양식 추가속성 테이블"을 참조하시기 바랍니다.
         **************************************************************************/

    propertyBag: {
      Balance: "2000", // 전잔액
      Deposit: "500", // 입금액
      CBalance: "2500", // 현잔액
    },
  };

  statementService.registIssue(testCorpNum, statement, memo, testUserID, emailSubject,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 1건의 전자명세서를 임시저장합니다.
 * - https://docs.popbill.com/statement/node/api#Register
 */
router.get("/register", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const ItemCode = 121;

  // 문서번호, 1~24자리 영문, 숫자, '-', '_' 조합으로 구성, 사업자별로 중복되지 않도록 구성
  const MgtKey = "20190917-002";

  // 전자명세서 정보
  const statement = {

    // [필수] 기재상 작성일자, 날짜형식(yyyyMMdd)
    writeDate: "20190917",

    // [필수] 영수, 청구 중 기재
    purposeType: "영수",

    // [필수] 과세형태, 과세, 영세, 면세 중 기재
    taxType: "과세",

    // 맞춤양식코드, 미기재시 기본양식으로 작성
    formCode: "",

    // [필수] 명세서 코드
    itemCode: ItemCode,

    // [필수] 문서번호
    mgtKey: MgtKey,

    /** ***********************************************************************
         *                             발신자 정보
         **************************************************************************/

    // 발신자 사업자번호
    senderCorpNum: testCorpNum,

    // 발신자 상호
    senderCorpName: "발신자 상호",

    // 발신자 주소
    senderAddr: "발신자 주소",

    // 발신자 대표자 성명
    senderCEOName: "발신자 대표자 성명",

    // 종사업장 식별번호, 필요시기재, 형식은 숫자 4자리
    senderTaxRegID: "",

    // 발신자 종목
    senderBizClass: "종목",

    // 발신자 업태
    senderBizType: "업태",

    // 발신자 담당자명
    senderContactName: "담당자명",

    // 발신자 메일주소
    senderEmail: "test@test.com",

    // 발신자 연락처
    senderTEL: "070-4304-2991",

    // 발신자 휴대폰번호
    senderHP: "000-111-222",

    /** ***********************************************************************
         *                             수신자 정보
         **************************************************************************/

    // 수신자 사업자번호
    receiverCorpNum: "8888888888",

    // 수신자 상호
    receiverCorpName: "수신자상호",

    // 수신자 대표자 성명
    receiverCEOName: "수신자 대표자 성명",

    // 수신자 주소
    receiverAddr: "수신자 주소",

    // 수신자 종사업장 식별번호, 필요시 기재
    recieverTaxRegID: "",

    // 수신자 종목
    receiverBizClass: "종목",

    // 수신자 업태
    receiverBizType: "업태",

    // 수신자 담당자명
    receiverContactName: "수신자 담당자 성명",

    // 수신자 메일주소
    // 팝빌 개발환경에서 테스트하는 경우에도 안내 메일이 전송되므로,
    // 실제 거래처의 메일주소가 기재되지 않도록 주의
    receiverEmail: "test@test.com",

    // 수신자 연락처
    receiverTEL: "070-1111-2222",

    // 수신자 휴대폰 번호
    receiverHP: "000111222",

    /** ***********************************************************************
         *                            전자명세서 기재정보
         **************************************************************************/

    // [필수] 공급가액 합계
    supplyCostTotal: "20000",

    // [필수] 세액 합계
    taxTotal: "2000",

    // [필수] 합계금액 (공급가액 합계+ 세액 합계)
    totalAmount: "22000",

    // 기재 상 '일련번호' 항목
    serialNum: "1",

    // 기재 상 '비고' 항목
    remark1: "비고1",
    remark2: "비고2",
    remark3: "비고3",

    // 사업자등록증 이미지 첨부 여부
    businessLicenseYN: false,

    // 통장사본 이미지 첨부 여부
    bankBookYN: false,


    /** ***********************************************************************
         *                          상세9항목(품목) 정보
         **************************************************************************/

    detailList: [
      {
        serialNum: 1, // 품목 일련번호 1부터 순차기재
        itemName: "품명",
        purchaseDT: "20190917", // 구매일자
        qty: "1", // 수량
        unitCost: "10000", // 단가
        spec: "규격", // 규격
        supplyCost: "10000", // 공급가액
        tax: "1000", // 세액
        remark: "비고",
      },
      {
        serialNum: 2, // 품목 일련번호 1부터 순차기재
        itemName: "품명2",
        purchaseDT: "20190917", // 구매일자
        qty: "1", // 수량
        unitCost: "10000", // 단가
        spec: "규격", // 규격
        supplyCost: "10000", // 공급가액
        tax: "1000", // 세액
        remark: "비고",
      },
    ],


    /** ***********************************************************************
         *                               전자명세서 추가속성
         * - 추가속성에 관한 자세한 사항은 "[전자명세서 API 연동매뉴얼] >
         *   5.2. 기본양식 추가속성 테이블"을 참조하시기 바랍니다.
         **************************************************************************/

    propertyBag: {
      Balance: "2000", // 전잔액
      Deposit: "500", // 입금액
      CBalance: "2500", // 현잔액
    },
  };

  statementService.register(testCorpNum, statement,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 1건의 전자명세서를 수정합니다.
 * - [임시저장] 상태의 전자명세서만 수정할 수 있습니다.
 * - https://docs.popbill.com/statement/node/api#Update
 */
router.get("/update", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const ItemCode = 121;

  // 문서번호
  const MgtKey = "20190917-001";


  // 전자명세서 정보
  const statement = {

    // [필수] 기재상 작성일자, 날짜형식(yyyyMMdd)
    writeDate: "20190917",

    // [필수] 영수, 청구 중 기재
    purposeType: "영수",

    // [필수] 과세형태, 과세, 영세, 면세 중 기재
    taxType: "과세",

    // 맞춤양식코드, 미기재시 기본양식으로 작성
    formCode: "",

    // [필수] 명세서 코드
    itemCode: ItemCode,

    // [필수] 문서번호
    mgtKey: MgtKey,

    /** ***********************************************************************
         *                             발신자 정보
         **************************************************************************/

    // 발신자 사업자번호
    senderCorpNum: testCorpNum,

    // 발신자 상호
    senderCorpName: "발신자 상호_수정",

    // 발신자 주소
    senderAddr: "발신자 주소_수정",

    // 발신자 대표자 성명
    senderCEOName: "발신자 대표자 성명",

    // 종사업장 식별번호, 필요시기재, 형식은 숫자 4자리
    senderTaxRegID: "",

    // 발신자 종목
    senderBizClass: "종목",

    // 발신자 업태
    senderBizType: "업태",

    // 발신자 담당자명
    senderContactName: "담당자명",

    // 발신자 메일주소
    senderEmail: "test@test.com",

    // 발신자 연락처
    senderTEL: "070-4304-2991",

    // 발신자 휴대폰번호
    senderHP: "000-111-222",

    /** ***********************************************************************
         *                             수신자 정보
         **************************************************************************/

    // 수신자 사업자번호
    receiverCorpNum: "8888888888",

    // 수신자 상호
    receiverCorpName: "수신자상호",

    // 수신자 대표자 성명
    receiverCEOName: "수신자 대표자 성명",

    // 수신자 주소
    receiverAddr: "수신자 주소",

    // 수신자 종사업장 식별번호, 필요시 기재
    recieverTaxRegID: "",

    // 수신자 종목
    receiverBizClass: "종목",

    // 수신자 업태
    receiverBizType: "업태",

    // 수신자 담당자명
    receiverContactName: "수신자 담당자 성명",

    // 수신자 메일주소
    // 팝빌 개발환경에서 테스트하는 경우에도 안내 메일이 전송되므로,
    // 실제 거래처의 메일주소가 기재되지 않도록 주의
    receiverEmail: "test@test.com",

    // 수신자 연락처
    receiverTEL: "070-1111-2222",

    // 수신자 휴대폰 번호
    receiverHP: "000111222",

    /** ***********************************************************************
         *                            전자명세서 기재정보
         **************************************************************************/

    // [필수] 공급가액 합계
    supplyCostTotal: "20000",

    // [필수] 세액 합계
    taxTotal: "2000",

    // [필수] 합계금액 (공급가액 합계+ 세액 합계)
    totalAmount: "22000",

    // 기재 상 '일련번호' 항목
    serialNum: "1",

    // 기재 상 '비고' 항목
    remark1: "비고1",
    remark2: "비고2",
    remark3: "비고3",

    // 사업자등록증 이미지 첨부 여부
    businessLicenseYN: false,

    // 통장사본 이미지 첨부 여부
    bankBookYN: false,


    /** ***********************************************************************
         *                          상세9항목(품목) 정보
         **************************************************************************/

    detailList: [
      {
        serialNum: 1, // 품목 일련번호 1부터 순차기재
        itemName: "품명",
        purchaseDT: "20190917", // 구매일자
        qty: "1", // 수량
        unitCost: "10000", // 단가
        spec: "규격", // 규격
        supplyCost: "10000", // 공급가액
        tax: "1000", // 세액
        remark: "비고",
      },
      {
        serialNum: 2, // 품목 일련번호 1부터 순차기재
        itemName: "품명2",
        purchaseDT: "20190917", // 구매일자
        qty: "1", // 수량
        unitCost: "10000", // 단가
        spec: "규격", // 규격
        supplyCost: "10000", // 공급가액
        tax: "1000", // 세액
        remark: "비고",
      },
    ],


    /** ***********************************************************************
         *                               전자명세서 추가속성
         * - 추가속성에 관한 자세한 사항은 "[전자명세서 API 연동매뉴얼] >
         *   5.2. 기본양식 추가속성 테이블"을 참조하시기 바랍니다.
         **************************************************************************/

    propertyBag: {
      Balance: "2000", // 전잔액
      Deposit: "500", // 입금액
      CBalance: "2500", // 현잔액
    },
  };

  statementService.update(testCorpNum, ItemCode, MgtKey, statement,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 1건의 [임시저장] 상태의 전자명세서를 발행처리합니다.
 * - https://docs.popbill.com/statement/node/api#Stmissue
 */
router.get("/issue", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  // 메모
  const memo = "발행메모";

  statementService.issue(testCorpNum, itemCode, mgtKey, memo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 1건의 전자명세서를 [발행취소] 처리합니다.
 * - https://docs.popbill.com/statement/node/api#Cancel
 */
router.get("/cancelIssue", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  // 메모
  const memo = "발행취소 메모";

  statementService.cancel(testCorpNum, itemCode, mgtKey, memo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 1건의 전자명세서를 삭제합니다.
 * - 전자명세서를 삭제하면 사용된 문서번호(mgtKey)를 재사용할 수 있습니다.
 * - https://docs.popbill.com/statement/node/api#Delete
 */
router.get("/delete", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  statementService.delete(testCorpNum, itemCode, mgtKey,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 1건의 전자명세서 상태/요약 정보를 확인합니다.
 * - https://docs.popbill.com/statement/node/api#GetInfo
 */
router.get("/getInfo", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  statementService.getInfo(testCorpNum, itemCode, mgtKey,
      function(result) {
        res.render("Statement/StatementInfo", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 다수건의 전자명세서 상태/요약 정보를 확인합니다.
 * - https://docs.popbill.com/statement/node/api#GetInfos
 */
router.get("/getInfos", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호 배열, 최대 1000건
  const mgtKeyList = ["20190917-001", "20190917-002", "20190917-003"];

  statementService.getInfos(testCorpNum, itemCode, mgtKeyList,
      function(result) {
        res.render("Statement/StatementInfos", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자명세서 1건의 상세정보를 조회합니다.
 * - https://docs.popbill.com/statement/node/api#GetDetailInfo
 */
router.get("/getDetailInfo", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190109-001";

  statementService.getDetailInfo(testCorpNum, itemCode, mgtKey,
      function(result) {
        res.render("Statement/StatementDetail", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 검색조건을 사용하여 전자명세서 목록을 조회합니다.
 * - https://docs.popbill.com/statement/node/api#Search
 */
router.get("/search", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 검색일자 유형, R-등록일자, W-작성일자, I-발행일자
  const DType = "W";

  // 시작일자, 작성형식(yyyyMMdd)
  const SDate = "20190901";

  // 종료일자, 작성형식(yyyyMMdd)
  const EDate = "20190930";

  // 명세서 문서상태값 배열, 전송상태(stateCode)값 배열
  const State = ["200", "3**"];

  // 전자명세서 종류코드 배열, 121-거래명세서, 122-청구서, 123-견적서, 124-발주서, 125-입금표, 126-영수증
  const ItemCode = [121, 122, 123, 124, 125, 126];

  // 거래처 정보, 거래처 상호 또는 사업자등록번호 기재, 미기재시 전체조회
  const QString = "";

  // 정렬방향, D-내림차순, A-오름차순
  const Order = "D";

  // 페이지 번호
  const Page = 1;

  // 페이지당 검색개수, 최대 1000건
  const PerPage = 10;

  statementService.search(testCorpNum, DType, SDate, EDate, State, ItemCode, QString, Order, Page, PerPage,
      function(result) {
        res.render("Statement/Search", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자명세서 상태 변경이력을 확인합니다.
 * - https://docs.popbill.com/statement/node/api#GetLogs
 */
router.get("/getLogs", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  statementService.getLogs(testCorpNum, itemCode, mgtKey,
      function(result) {
        res.render("Statement/StatementLogs", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌 전자명세서 문서함 관련 팝업 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/statement/node/api#GetURL
 */
router.get("/getURL", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // SBOX(매출문서함), TBOX(임시문서함)
  const TOGO = "SBOX";

  statementService.getURL(testCorpNum, TOGO,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 1건의 전자명세서 보기 팝업 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/statement/node/api#GetPopUpURL
 */
router.get("/getPopUpURL", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  statementService.getPopUpURL(testCorpNum, itemCode, mgtKey,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 1건의 전자명세서 보기 URL을 반환합니다. (메뉴/버튼 제외)
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 */
router.get("/getViewURL", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  statementService.getViewURL(testCorpNum, itemCode, mgtKey,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 1건의 전자명세서 인쇄팝업 URL을 반환합니다. (발신자/수신자)
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/statement/node/api#GetPrintURL
 */
router.get("/getPrintURL", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  statementService.getPrintURL(testCorpNum, itemCode, mgtKey,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 1건의 전자명세서 인쇄팝업 URL을 반환합니다. (수신자)
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/statement/node/api#GetEPrintURL
 */
router.get("/getEPrintURL", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  statementService.getEPrintURL(testCorpNum, itemCode, mgtKey,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 다수건의 전자명세서 인쇄팝업 URL을 반환합니다. (최대 100건)
 * - 보안정책으로 인해 반환된 URL의 유효시간은 30초입니다.
 * - https://docs.popbill.com/statement/node/api#GetMassPrintURL
 */
router.get("/getMassPrintURL", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호 배열, 최대 100건
  const mgtKeyList = ["20190917-001", "20190917-002", "20190917-002"];

  statementService.getMassPrintURL(testCorpNum, itemCode, mgtKeyList,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 수신자 메일링크 URL을 반환합니다.
 * - 메일링크 URL은 유효시간이 존재하지 않습니다.
 * - https://docs.popbill.com/statement/node/api#GetMailURL
 */
router.get("/getMailURL", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  statementService.getMailURL(testCorpNum, itemCode, mgtKey,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌에 로그인 상태로 접근할 수 있는 팝업 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/statement/node/api#GetAccessURL
 */
router.get("/getAccessURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "testkorea";

  statementService.getAccessURL(testCorpNum, testUserID,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자명세서에 첨부파일을 등록합니다.
 * - 첨부파일 등록은 전자명세서가 [임시저장] 상태인 경우에만 가능합니다.
 * - 첨부파일은 최대 5개까지 등록할 수 있습니다.
 * - https://docs.popbill.com/statement/node/api#AttachFile
 */
router.get("/attachFile", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  // 파일경로
  const filePaths = ["./test.jpg"];

  // 파일명
  const fileName = filePaths[0].replace(/^.*[\\\/]/, "");

  statementService.attachFile(testCorpNum, itemCode, mgtKey, fileName, filePaths,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자명세서에 첨부된 파일을 삭제합니다.
 * - 파일을 식별하는 파일아이디는 첨부파일 목록(GetFiles API) 의 응답항목
 *   중 파일아이디(AttachedFile) 값을 통해 확인할 수 있습니다.
 * - https://docs.popbill.com/statement/node/api#DeleteFile
 */
router.get("/deleteFile", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  // 파일아이디 getFiles API의 attachedFile 변수값
  const fileID = "5991857A-1CBC-4BB7-B32F-4126FFC1E64C.PBF";

  statementService.deleteFile(testCorpNum, itemCode, mgtKey, fileID,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자명세서에 첨부된 파일의 목록을 확인합니다.
 * - 응답항목 중 파일아이디(AttachedFile) 항목은 파일삭제(DeleteFile API)
 *   호출시 이용할 수 있습니다.
 * - https://docs.popbill.com/statement/node/api#GetFiles
 */
router.get("/getFiles", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  statementService.getFiles(testCorpNum, itemCode, mgtKey,
      function(result) {
        res.render("Statement/AttachedFile", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 발행 안내메일을 재전송합니다.
 * - https://docs.popbill.com/statement/node/api#SendEmail
 */
router.get("/sendEmail", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  // 수신메일주소
  // 팝빌 개발환경에서 테스트하는 경우에도 안내 메일이 전송되므로,
  // 실제 거래처의 메일주소가 기재되지 않도록 주의
  const receiver = "test@test.com";

  statementService.sendEmail(testCorpNum, itemCode, mgtKey, receiver,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 알림문자를 전송합니다. (단문/SMS- 한글 최대 45자)
 * - 알림문자 전송시 포인트가 차감됩니다. (전송실패시 환불처리)
 * - 전송내역 확인은 "팝빌 로그인" > [문자 팩스] > [문자] > [전송내역] 탭에서 전송결과를 확인할 수 있습니다.
 * - https://docs.popbill.com/statement/node/api#SendSMS
 */
router.get("/sendSMS", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  // 발신번호
  const senderNum = "07043042992";

  // 수신번호
  const receiverNum = "010111222";

  // 문자메시지 내용, 최대 90Byte 초과시 길이가 조정되어 전송됨
  const contents = "전자명세서 알림문자재전송 테스트";

  statementService.sendSMS(testCorpNum, itemCode, mgtKey, senderNum, receiverNum, contents,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자명세서를 팩스전송합니다.
 * - 팩스 전송 요청시 포인트가 차감됩니다. (전송실패시 환불처리)
 * - 전송내역 확인은 "팝빌 로그인" > [문자 팩스] > [팩스] > [전송내역] 메뉴에서 전송결과를 확인할 수 있습니다.
 * - https://docs.popbill.com/statement/node/api#SendFAX
 */
router.get("/sendFAX", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  // 발신번호
  const senderNum = "07043042992";

  // 수신팩스번호
  const receiverNum = "010111222";

  statementService.sendFAX(testCorpNum, itemCode, mgtKey, senderNum, receiverNum,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌에 전자명세서를 등록하지 않고 수신자에게 팩스전송합니다.
 * - 팩스 전송 요청시 포인트가 차감됩니다. (전송실패시 환불처리)
 * - 팩스 발행 요청시 작성한 문서번호는 팩스전송 파일명으로 사용됩니다.
 * - 전송내역 확인은 "팝빌 로그인" > [문자 팩스] > [팩스] > [전송내역] 메뉴에서 전송결과를 확인할 수 있습니다.
 * - 팩스 전송결과를 확인하기 위해서는 선팩스 전송 요청 시 반환받은 접수번호를 이용하여
 *   팩스 API의 전송결과 확인 (GetFaxDetail) API를 이용하면 됩니다.
 * - https://docs.popbill.com/statement/node/api#FAXSend
 */
router.get("/FAXSend", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 발신번호
  const sendNum = "07043042991";

  // 수신팩스번호
  const receiveNum = "010111222";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const ItemCode = 121;

  // 문서번호, 1~24자리 영문, 숫자, '-', '_' 조합으로 구성, 사업자별로 중복되지 않도록 생성
  const MgtKey = "20190917-001";

  // 전자명세서 정보
  const statement = {

    // [필수] 기재상 작성일자, 날짜형식(yyyyMMdd)
    writeDate: "20190109",

    // [필수] 영수, 청구 중 기재
    purposeType: "영수",

    // [필수] 과세형태, 과세, 영세, 면세 중 기재
    taxType: "과세",

    // 맞춤양식코드, 미기재시 기본양식으로 작성
    formCode: "",

    // [필수] 명세서 코드
    itemCode: ItemCode,

    // [필수] 문서번호
    mgtKey: MgtKey,

    /** ***********************************************************************
         *                             발신자 정보
         **************************************************************************/

    // 발신자 사업자번호
    senderCorpNum: testCorpNum,

    // 발신자 상호
    senderCorpName: "발신자 상호",

    // 발신자 주소
    senderAddr: "발신자 주소",

    // 발신자 대표자 성명
    senderCEOName: "발신자 대표자 성명",

    // 종사업장 식별번호, 필요시기재, 형식은 숫자 4자리
    senderTaxRegID: "",

    // 발신자 종목
    senderBizClass: "종목",

    // 발신자 업태
    senderBizType: "업태",

    // 발신자 담당자명
    senderContactName: "담당자명",

    // 발신자 메일주소
    senderEmail: "test@test.com",

    // 발신자 연락처
    senderTEL: "070-4304-2991",

    // 발신자 휴대폰번호
    senderHP: "000-111-222",

    /** ***********************************************************************
         *                             수신자 정보
         **************************************************************************/

    // 수신자 사업자번호
    receiverCorpNum: "8888888888",

    // 수신자 상호
    receiverCorpName: "수신자상호",

    // 수신자 대표자 성명
    receiverCEOName: "수신자 대표자 성명",

    // 수신자 주소
    receiverAddr: "수신자 주소",

    // 수신자 종사업장 식별번호, 필요시 기재
    recieverTaxRegID: "",

    // 수신자 종목
    receiverBizClass: "종목",

    // 수신자 업태
    receiverBizType: "업태",

    // 수신자 담당자명
    receiverContactName: "수신자 담당자 성명",

    // 수신자 메일주소
    // 팝빌 개발환경에서 테스트하는 경우에도 안내 메일이 전송되므로,
    // 실제 거래처의 메일주소가 기재되지 않도록 주의
    receiverEmail: "test@test.com",

    // 수신자 연락처
    receiverTEL: "070-1111-2222",

    // 수신자 휴대폰 번호
    receiverHP: "000111222",

    /** ***********************************************************************
         *                            전자명세서 기재정보
         **************************************************************************/

    // [필수] 공급가액 합계
    supplyCostTotal: "20000",

    // [필수] 세액 합계
    taxTotal: "2000",

    // [필수] 합계금액 (공급가액 합계+ 세액 합계)
    totalAmount: "22000",

    // 기재 상 '일련번호' 항목
    serialNum: "1",

    // 기재 상 '비고' 항목
    remark1: "비고1",
    remark2: "비고2",
    remark3: "비고3",

    // 사업자등록증 이미지 첨부 여부
    businessLicenseYN: false,

    // 통장사본 이미지 첨부 여부
    bankBookYN: false,


    /** ***********************************************************************
         *                          상세9항목(품목) 정보
         **************************************************************************/

    detailList: [
      {
        serialNum: 1, // 품목 일련번호 1부터 순차기재
        itemName: "품명",
        purchaseDT: "20190917", // 구매일자
        qty: "1", // 수량
        unitCost: "10000", // 단가
        spec: "규격", // 규격
        supplyCost: "10000", // 공급가액
        tax: "1000", // 세액
        remark: "비고",
      },
      {
        serialNum: 2, // 품목 일련번호 1부터 순차기재
        itemName: "품명2",
        purchaseDT: "20190917", // 구매일자
        qty: "1", // 수량
        unitCost: "10000", // 단가
        spec: "규격", // 규격
        supplyCost: "10000", // 공급가액
        tax: "1000", // 세액
        remark: "비고",
      },
    ],


    /** ***********************************************************************
         *                               전자명세서 추가속성
         * - 추가속성에 관한 자세한 사항은 "[전자명세서 API 연동매뉴얼] >
         *   5.2. 기본양식 추가속성 테이블"을 참조하시기 바랍니다.
         **************************************************************************/

    propertyBag: {
      Balance: "2000", // 전잔액
      Deposit: "500", // 입금액
      CBalance: "2500", // 현잔액
    },
  };

  statementService.FAXSend(testCorpNum, statement, sendNum, receiveNum,
      function(receiptNum) {
        res.render("result", {path: req.path, result: receiptNum});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자명세서에 다른 전자명세서 1건을 첨부합니다.
 * - https://docs.popbill.com/statement/node/api#AttachStatement
 */
router.get("/attachStatement", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 종류코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190917-001";

  // 첨부할 명세서 종류코드
  const subItemCode = 121;

  // 첨부할 명세서 문서번호
  const subMgtKey = "20190109-002";

  statementService.attachStatement(testCorpNum, itemCode, mgtKey, subItemCode, subMgtKey,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자명세서에 첨부된 다른 전자명세서를 첨부해제합니다.
 * - https://docs.popbill.com/statement/node/api#DetachStatement
 */
router.get("/detachStatement", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 종류코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  // 문서번호
  const mgtKey = "20190109-001";

  // 첨부해제할 명세서 종류코드
  const subItemCode = 121;

  // 첨부해제할 명세서 문서번호
  const subMgtKey = "20190917-002";

  statementService.detachStatement(testCorpNum, itemCode, mgtKey, subItemCode, subMgtKey,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자명세서 관련 메일전송 항목에 대한 전송여부를 목록으로 반환합니다.
 * - https://docs.popbill.com/statement/node/api#ListEmailConfig
 */
router.get("/listEmailConfig", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  statementService.listEmailConfig(testCorpNum,
      function(result) {
        res.render("Statement/ListEmailConfig", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자명세서 관련 메일전송 항목에 대한 전송여부를 수정합니다.
 * - https://docs.popbill.com/statement/node/api#UpdateEmailConfig
 *
 * 메일전송유형
 * SMT_ISSUE : 수신자에게 전자명세서가 발행 되었음을 알려주는 메일입니다.
 * SMT_ACCEPT : 발신자에게 전자명세서가 승인 되었음을 알려주는 메일입니다.
 * SMT_DENY : 발신자에게 전자명세서가 거부 되었음을 알려주는 메일입니다.
 * SMT_CANCEL : 수신자에게 전자명세서가 취소 되었음을 알려주는 메일입니다.
 * SMT_CANCEL_ISSUE : 수신자에게 전자명세서가 발행취소 되었음을 알려주는 메일입니다.
 */
router.get("/updateEmailConfig", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 메일 전송 유형
  const emailType = "SMT_ISSUE";

  // 전송 여부 (true = 전송, false = 미전송)
  const sendYN = true;

  statementService.updateEmailConfig(testCorpNum, emailType, sendYN,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 잔여포인트를 확인합니다.
 * - 과금방식이 파트너과금인 경우 파트너 잔여포인트(GetPartnerBalance API)를 통해 확인하시기 바랍니다.
 * - https://docs.popbill.com/statement/node/api#GetBalance
 */
router.get("/getBalance", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  statementService.getBalance(testCorpNum,
      function(remainPoint) {
        res.render("result", {path: req.path, result: remainPoint});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌 연동회원 포인트 충전 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/statement/node/api#GetChargeURL
 */
router.get("/getChargeURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "testkorea";

  statementService.getChargeURL(testCorpNum, testUserID,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 파트너의 잔여포인트를 확인합니다.
 * - 과금방식이 연동과금인 경우 연동회원 잔여포인트(GetBalance API)를 이용하시기 바랍니다.
 * - https://docs.popbill.com/statement/node/api#GetPartnerBalance
 */
router.get("/getPartnerBalance", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  statementService.getPartnerBalance(testCorpNum,
      function(remainPoint) {
        res.render("result", {path: req.path, result: remainPoint});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 파트너 포인트 충전 팝업 URL을 반환합니다.
 * - 보안정책에 따라 반환된 URL은 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/statement/node/api#GetPartnerURL
 */
router.get("/getPartnerURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // CHRG(포인트충전)
  const TOGO = "CHRG";

  statementService.getPartnerURL(testCorpNum, TOGO,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자명세서 발행단가를 확인합니다.
 * - https://docs.popbill.com/statement/node/api#GetUnitCost
 */
router.get("/getUnitCost", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  // 명세서 코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  statementService.getUnitCost(testCorpNum, itemCode,
      function(unitCost) {
        res.render("result", {path: req.path, result: unitCost});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전자명세서 API 서비스 과금정보를 확인합니다.
 * - https://docs.popbill.com/statement/node/api#GetChargeInfo
 */
router.get("/getChargeInfo", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 명세서 종류코드 - 121(거래명세서), 122(청구서), 123(견적서), 124(발주서), 125(입금표), 126(영수증)
  const itemCode = 121;

  statementService.getChargeInfo(testCorpNum, itemCode,
      function(result) {
        res.render("Base/getChargeInfo", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 해당 사업자의 파트너 연동회원 가입여부를 확인합니다.
 * - https://docs.popbill.com/statement/node/api#CheckIsMember
 */
router.get("/checkIsMember", function(req, res, next) {
  // 조회할 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  statementService.checkIsMember(testCorpNum,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌 회원아이디 중복여부를 확인합니다.
 * - https://docs.popbill.com/statement/node/api#CheckID
 */
router.get("/checkID", function(req, res, next) {
  // 조회할 아이디
  const testID = "testkorea";

  statementService.checkID(testID,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌 연동회원 가입을 요청합니다.
 * - https://docs.popbill.com/statement/node/api#JoinMember
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

  statementService.joinMember(joinInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 회사정보를 확인합니다.
 * - https://docs.popbill.com/statement/node/api#GetCorpInfo
 */
router.get("/getCorpInfo", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  statementService.getCorpInfo(testCorpNum,
      function(result) {
        res.render("Base/getCorpInfo", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 회사정보를 수정합니다
 * - https://docs.popbill.com/statement/node/api#UpdateCorpInfo
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

  statementService.updateCorpInfo(testCorpNum, corpInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 담당자를 신규로 등록합니다.
 * - https://docs.popbill.com/statement/node/api#RegistContact
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

  statementService.registContact(testCorpNum, contactInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 담당자 목록을 확인합니다.
 * - https://docs.popbill.com/statement/node/api#ListContact
 */
router.get("/listContact", function(req, res, next) {
  // 팝빌회원 사업자번호
  const testCorpNum = "1234567890";

  statementService.listContact(testCorpNum,
      function(result) {
        res.render("Base/listContact", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 담당자 정보를 수정합니다.
 * - https://docs.popbill.com/statement/node/api#UpdateContact
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

  statementService.updateContact(testCorpNum, testUserID, contactInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

module.exports = router;
