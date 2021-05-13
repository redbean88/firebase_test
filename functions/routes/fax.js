const express = require("express");
const router = express.Router();
const popbill = require("popbill");
const https = require("https");

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
 * 팩스 API 서비스 클래스 생성
 */
const faxService = popbill.FaxService();

/*
 * Fax API Index 목록
 */
router.get("/", function(req, res, next) {
  res.render("Fax/index", {});
});

/*
 * 팩스 발신번호 관리 팝업 URL을 반합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/fax/node/api#GetSenderNumberMgtURL
 */
router.get("/getSenderNumberMgtURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "testkorea";

  faxService.getSenderNumberMgtURL(testCorpNum, testUserID,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팩스 발신번호 목록을 반환합니다.
 * - https://docs.popbill.com/fax/node/api#GetSenderNumberList
 */
router.get("/getSenderNumberList", function(req, res, next) {
  // 조회할 아이디
  const testCorpNum = "1234567890";

  faxService.getSenderNumberList(testCorpNum,
      function(result) {
        res.render("Fax/SenderNumberList", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팩스를 전송합니다. (전송할 파일 개수는 최대 20개까지 가능)
 * - https://docs.popbill.com/fax/node/api#SendFAX
 */
router.get("/sendFAX", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 발신번호
  const senderNum = "07043042991";

  // 발신자명
  const senderName = "발신자명";

  // 광고팩스 전송여부
  const adsYN = false;

  // 수신팩스번호
  const receiveNum = "070111222";

  // 수신자명
  const receiveName = "수신자명";

  // 파일경로 배열, 전송개수 촤대 20개
  const filePaths = ["test.jpg"];

  // 팩스제목
  const title = "팩스전송";

  // 예약전송일시 날짜형식(yyyyMMddHHmmss), 미기재시 즉시전송
  const reserveDT = "";

  // 전송요청번호
  // 파트너가 전송 건에 대해 관리번호를 구성하여 관리하는 경우 사용.
  // 1~36자리로 구성. 영문, 숫자, 하이픈(-), 언더바(_)를 조합하여 팝빌 회원별로 중복되지 않도록 할당.
  const requestNum = "";

  // 팝빌회원 아이디
  const userID = "testkorea";

  faxService.sendFax(testCorpNum, senderNum, receiveNum, receiveName, filePaths, reserveDT, senderName, adsYN, title, requestNum, userID,
      function(receiptNum) {
        res.render("result", {path: req.path, result: receiptNum});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * [대량전송] 팩스를 전송합니다. (전송할 파일 개수는 최대 20개까지 가능)
 * - https://docs.popbill.com/fax/node/api#sendFAX_multi
 */
router.get("/sendFAX_multi", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 발신번호
  const senderNum = "07043042991";

  // 발신자명
  const senderName = "발신자명";

  // 파일경로 배열, 전송개수 촤대 20개
  const filePaths = ["test.jpg", "test.jpg"];

  // 수신자정보 배열, 최대 1000건
  const Receivers = [
    {
      receiveName: "수신자명1", // 수신자명
      receiveNum: "070111222", // 수신팩스번호
    },
    {
      receiveName: "수신자명2",
      receiveNum: "070111222",
    },
  ];

  // 예약전송일시 날짜형식(yyyyMMddHHmmss), 미기재시 즉시전송
  const reserveDT = "";

  // 광고팩스 전송여부
  const adsYN = false;

  // 팩스제목
  const title = "팩스대량전송";

  // 전송요청번호
  // 파트너가 전송 건에 대해 관리번호를 구성하여 관리하는 경우 사용.
  // 1~36자리로 구성. 영문, 숫자, 하이픈(-), 언더바(_)를 조합하여 팝빌 회원별로 중복되지 않도록 할당.
  const requestNum = "";

  // 팝빌회원 아이디
  const userID = "testkorea";

  faxService.sendFax(testCorpNum, senderNum, Receivers, "", filePaths, reserveDT, senderName, adsYN, title, requestNum, userID,
      function(receiptNum) {
        res.render("result", {path: req.path, result: receiptNum});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

router.get("/sendFAXBinary", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 발신번호
  const senderNum = "07043042991";

  // 발신자명
  const senderName = "발신자명";

  // 광고팩스 전송여부
  const adsYN = false;

  // 수신팩스번호
  const receiveNum = "070111222";

  // 수신자명
  const receiveName = "수신자명";

  // 팩스제목
  const title = "팩스전송";

  // 예약전송일시 날짜형식(yyyyMMddHHmmss), 미기재시 즉시전송
  const reserveDT = "";

  // 전송요청번호
  // 파트너가 전송 건에 대해 관리번호를 구성하여 관리하는 경우 사용.
  // 1~36자리로 구성. 영문, 숫자, 하이픈(-), 언더바(_)를 조합하여 팝빌 회원별로 중복되지 않도록 할당.
  const requestNum = "";

  // 팝빌회원 아이디
  const userID = "testkorea";


  const targeturl = "https://d17ecin4ilxxme.cloudfront.net/notice/20200626_01.jpg";

  https.get(targeturl, function(response) {
    const data = [];
    response.on("data", function(chunk) {
      data.push(chunk);
    }).on("end", function() {
      if (response.statusCode == 200) {
        const binary = Buffer.concat(data);

        // Binary 파일정보 배열, 전송개수 촤대 20개
        const BinaryFiles = [];
        BinaryFiles.push(
            {
              // 파일명
              fileName: "20200626_01.jpg",
              // 파일데이터
              fileData: binary,
            }
        );

        BinaryFiles.push({fileName: "20200626_01.jpg", fileData: binary});

        faxService.sendFaxBinary(testCorpNum, senderNum, receiveNum, receiveName, BinaryFiles, reserveDT, senderName, adsYN, title, requestNum, userID,
            function(receiptNum) {
              res.render("result", {path: req.path, result: receiptNum});
            }, function(Error) {
              res.render("response", {path: req.path, code: Error.code, message: Error.message});
            });
      } else {
        res.render("response", {path: req.path, code: -99999999, message: response.statusCode});
      }
    });
  }).on("error", function(err) {
    res.render("response", {path: req.path, code: -99999999, message: err.message});
  });
});

/*
 * 팩스를 재전송합니다.
 * - 접수일로부터 60일이 경과된 경우 재전송할 수 없습니다.
 * - 팩스 재전송 요청시 포인트가 차감됩니다. (전송실패시 환불처리)
 * - https://docs.popbill.com/fax/node/api#ResendFAX
 */
router.get("/resendFAX", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팩스 접수번호
  const receiptNum = "019032511132400001";

  // 발신번호, 공백처리시 기존전송정보로 재전송
  const senderNum = "07043042991";

  // 발신자명, 공백처리시 기존전송정보로 재전송
  const senderName = "발신자명";

  // 수신팩스번호/수신자명 모두
  // 수신번호
  const receiveNum = "";

  // 수신자명
  const receiveName = "";

  // 예약전송일시 날짜형식(yyyyMMddHHmmss), 미기재시 즉시전송
  const reserveDT = "";

  // 팩스제목
  const title = "팩스재전송";

  // 전송요청번호
  // 파트너가 전송 건에 대해 관리번호를 구성하여 관리하는 경우 사용.
  // 1~36자리로 구성. 영문, 숫자, 하이픈(-), 언더바(_)를 조합하여 팝빌 회원별로 중복되지 않도록 할당.
  const requestNum = "";

  // 팝빌회원 아이디
  const userID = "testkorea";

  faxService.resendFax(testCorpNum, receiptNum, senderNum, senderName, receiveNum, receiveName, reserveDT, title, requestNum, userID,
      function(receiptNum) {
        res.render("result", {path: req.path, result: receiptNum});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 전송요청번호(requestNum)을 할당한 팩스를 재전송합니다.
 * - 접수일로부터 60일이 경과된 경우 재전송할 수 없습니다.
 * - 팩스 재전송 요청시 포인트가 차감됩니다. (전송실패시 환불처리)
 * - https://docs.popbill.com/fax/node/api#ResendFAXRN
 */
router.get("/resendFAXRN", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 원본 팩스 전송시 할당한 전송요청번호(requestNum)
  const orgRequestNum = "20190917-001";

  // 발신번호, 공백처리시 기존전송정보로 재전송
  const senderNum = "";

  // 발신자명, 공백처리시 기존전송정보로 재전송
  const senderName = "";

  // 수신번호
  const receiveNum = "";

  // 수신자명
  const receiveName = "";

  // 예약전송일시 날짜형식(yyyyMMddHHmmss), 미기재시 즉시전송
  const reserveDT = "";

  // 팩스제목
  const title = "팩스재전송 (요청번호할당)";

  // 전송요청번호
  // 파트너가 전송 건에 대해 관리번호를 구성하여 관리하는 경우 사용.
  // 1~36자리로 구성. 영문, 숫자, 하이픈(-), 언더바(_)를 조합하여 팝빌 회원별로 중복되지 않도록 할당.
  const reqeustNum = "";

  // 팝빌회원 아이디
  const userID = "testkorea";

  faxService.resendFaxRN(testCorpNum, orgRequestNum, senderNum, senderName, receiveNum, receiveName, reserveDT, title, reqeustNum, userID,
      function(receiptNum) {
        res.render("result", {path: req.path, result: receiptNum});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * [대량전송] 팩스를 재전송합니다.
 * - 접수일로부터 60일이 경과된 경우 재전송할 수 없습니다.
 * - 팩스 재전송 요청시 포인트가 차감됩니다. (전송실패시 환불처리)
 * - https://docs.popbill.com/fax/node/api#ResendFAX_multi
 */
router.get("/resendFAX_multi", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팩스 접수번호
  const receiptNum = "019032510182200001";

  // 발신번호, 공백처리시 기존전송정보로 재전송
  const senderNum = "";

  // 발신자명, 공백처리시 기존전송정보로 재전송
  const senderName = "";

  // 수신자정보 배열, 최대 1000건
  const Receivers = [
    {
      receiveName: "수신자명1", // 수신자명
      receiveNum: "111222333", // 수신팩스번호
    },
    {
      receiveName: "수신자명2",
      receiveNum: "000111222",
    },
  ];

  // 수신자정보를 기존전송정보와 동일하게 재전송하는 경우 아래코드 적용
  // var Receivers = null;

  // 예약전송일시 날짜형식(yyyyMMddHHmmss), 미기재시 즉시전송
  const reserveDT = "";

  // 팩스제목
  const title = "팩스재전송 대량 전송";

  // 전송요청번호
  // 파트너가 전송 건에 대해 관리번호를 구성하여 관리하는 경우 사용.
  // 1~36자리로 구성. 영문, 숫자, 하이픈(-), 언더바(_)를 조합하여 팝빌 회원별로 중복되지 않도록 할당.
  const reqeustNum = "";

  // 팝빌회원 아이디
  const userID = "testkorea";

  faxService.resendFax(testCorpNum, receiptNum, senderNum, senderName, Receivers, "", reserveDT, title, reqeustNum, userID,
      function(receiptNum) {
        res.render("result", {path: req.path, result: receiptNum});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * [대량전송] 전송요청번호(requestNum)을 할당한 팩스를 재전송합니다.
 * - 접수일로부터 60일이 경과된 경우 재전송할 수 없습니다.
 * - 팩스 재전송 요청시 포인트가 차감됩니다. (전송실패시 환불처리)
 * - https://docs.popbill.com/fax/node/api#ResendFAXRN_multi
 */
router.get("/resendFAXRN_multi", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 원본 팩스 전송시 할당한 전송요청번호(requestNum)
  const orgRequestNum = "20190917-001";

  // 발신번호, 공백처리시 기존전송정보로 재전송
  const senderNum = "";

  // 발신자명, 공백처리시 기존전송정보로 재전송
  const senderName = "";

  // 수신자정보 배열, 최대 1000건
  const Receivers = [
    {
      receiveName: "수신자명1", // 수신자명
      receiveNum: "111222333", // 수신팩스번호
    },
    {
      receiveName: "수신자명2",
      receiveNum: "000111222",
    },
  ];
  // 수신자정보를 기존전송정보와 동일하게 재전송하는 경우 아래코드 적용
    // var Receivers = null;

  // 예약전송일시 날짜형식(yyyyMMddHHmmss), 미기재시 즉시전송
  const reserveDT = "";

  // 팩스제목
  const title = "팩스재전송 대량 전송 (요청번호할당)";

  // 팩스 접수번호
  const reqeustNum = "";

  // 팝빌회원 아이디
  const userID = "testkorea";

  faxService.resendFaxRN(testCorpNum, orgRequestNum, senderNum, senderName, Receivers, "", reserveDT, title, reqeustNum, userID,
      function(receiptNum) {
        res.render("result", {path: req.path, result: receiptNum});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팩스전송요청시 발급받은 접수번호(receiptNum)로 팩스 예약전송건을 취소합니다.
 * - 예약전송 취소는 예약전송시간 10분전까지 가능하며, 팩스변환 이후 가능합니다.
 * - https://docs.popbill.com/fax/node/api#CancelReserve
 */
router.get("/cancelReserve", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팩스전송 접수번호
  const receiptNum = "018092811330600001";

  faxService.cancelReserve(testCorpNum, receiptNum,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팩스전송요청시 할당한 전송요청번호(requestNum)로 팩스 예약전송건을 취소합니다.
 * - 예약전송 취소는 예약전송시간 10분전까지 가능하며, 팩스변환 이후 가능합니다.
 * - https://docs.popbill.com/fax/node/api#CancelReserveRN
 */
router.get("/cancelReserveRN", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팩스전송 요청번호
  const requestNum = "20190109-001";

  faxService.cancelReserveRN(testCorpNum, requestNum,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팩스전송요청시 발급받은 접수번호(receiptNum)로 전송결과를 확인합니다
 * - https://docs.popbill.com/fax/node/api#GetFaxResult
 */
router.get("/getFaxResult", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팩스전송 접수번호
  const receiptNum = "019010912104300001";

  faxService.getFaxResult(testCorpNum, receiptNum,
      function(result) {
        res.render("Fax/FaxResult", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팩스전송요청시 할당한 전송요청번호(requestNum)으로 전송결과를 확인합니다
 * - https://docs.popbill.com/fax/node/api#GetFaxResultRN
 */
router.get("/getFaxResultRN", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팩스전송 요청번호
  const requestNum = "20190917-001";

  faxService.getFaxResultRN(testCorpNum, requestNum,
      function(result) {
        res.render("Fax/FaxResult", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 검색조건을 사용하여 팩스 전송내역 목록을 확인합니다.
 * - 최대 검색기간 : 6개월 이내
 * - https://docs.popbill.com/fax/node/api#Search
 */
router.get("/search", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 시작일자, 날짜형식(yyyyMMdd)
  const SDate = "20190901";

  // 종료일자, 날짜형식(yyyyMMdd)
  const EDate = "20190930";

  // 전송상태값 배열, 1-대기, 2-성공, 3-실패, 4-취소
  const State = [1, 2, 3, 4];

  // 예약여부, true-예약전송건 조회, false-전체조회
  const ReserveYN = false;

  // 개인조회여부, true-개인조회, false-회사조회
  const SenderOnly = false;

  // 정렬방향, D-내림차순, A-오름차순
  const Order = "D";

  // 페이지 번호
  const Page = 1;

  // 페이지당 검색개수, 최대 1000건
  const PerPage = 10;

  // 조회 검색어.
  // 팩스 전송시 입력한 발신자명 또는 수신자명 기재.
  // 조회 검색어를 포함한 발신자명 또는 수신자명을 검색합니다.
  const QString = "";

  faxService.search(testCorpNum, SDate, EDate, State, ReserveYN, SenderOnly, Order, Page, PerPage, QString,
      function(result) {
        res.render("Fax/Search", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팩스 전송내역 팝업 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/fax/node/api#GetSentListURL
 */
router.get("/getSentListURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "testkorea";

  faxService.getSentListURL(testCorpNum, testUserID,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 접수한 팩스 전송건에 대한 미리보기 팝업 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/fax/node/api#GetPreviewURL
 */
router.get("/getPreviewURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팩스 접수번호
  const receiptNum = "018091015373100001";

  // 팝빌회원 아이디
  const testUserID = "testkorea";

  faxService.getPreviewURL(testCorpNum, receiptNum, testUserID,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 잔여포인트를 확인합니다.
 * - 과금방식이 파트너과금인 경우 파트너 잔여포인트(GetPartnerBalance API) 를 통해 확인하시기 바랍니다.
 * - https://docs.popbill.com/fax/node/api#GetBalance
 */
router.get("/getBalance", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  faxService.getBalance(testCorpNum,
      function(remainPoint) {
        res.render("result", {path: req.path, result: remainPoint});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌 연동회원 포인트 충전 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/fax/node/api#GetChargeURL
 */
router.get("/getChargeURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "testkorea";

  faxService.getChargeURL(testCorpNum, testUserID,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 파트너의 잔여포인트를 확인합니다.
 * - 과금방식이 연동과금인 경우 연동회원 잔여포인트(GetBalance API)를 이용하시기 바랍니다.
 * - https://docs.popbill.com/fax/node/api#GetPartnerBalance
 */
router.get("/getPartnerBalance", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  faxService.getPartnerBalance(testCorpNum,
      function(remainPoint) {
        res.render("result", {path: req.path, result: remainPoint});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 파트너 포인트 충전 팝업 URL을 반환합니다.
 * - 보안정책에 따라 반환된 URL은 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/fax/node/api#GetPartnerURL
 */
router.get("/getPartnerURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // CHRG(포인트충전)
  const TOGO = "CHRG";

  faxService.getPartnerURL(testCorpNum, TOGO,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팩스 전송단가를 확인합니다.
 * - https://docs.popbill.com/fax/node/api#GetUnitCost
 */
router.get("/getUnitCost", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  faxService.getUnitCost(testCorpNum,
      function(unitCost) {
        res.render("result", {path: req.path, result: unitCost});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 팩스 API 서비스 과금정보를 확인합니다.
 * - https://docs.popbill.com/fax/node/api#GetChargeInfo
 */
router.get("/getChargeInfo", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  faxService.getChargeInfo(testCorpNum,
      function(result) {
        res.render("Base/getChargeInfo", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 해당 사업자의 파트너 연동회원 가입여부를 확인합니다.
 * - https://docs.popbill.com/fax/node/api#CheckIsMember
 */
router.get("/checkIsMember", function(req, res, next) {
  // 조회할 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  faxService.checkIsMember(testCorpNum,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌 회원아이디 중복여부를 확인합니다.
 * - https://docs.popbill.com/fax/node/api#CheckID
 */
router.get("/checkID", function(req, res, next) {
  // 조회할 아이디
  const testID = "testkorea";

  faxService.checkID(testID,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌 연동회원 가입을 요청합니다.
 * - https://docs.popbill.com/fax/node/api#JoinMember
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

  faxService.joinMember(joinInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 팝빌(www.popbill.com)에 로그인된 팝빌 URL을 반환합니다.
 * - 반환된 URL은 보안정책에 따라 30초의 유효시간을 갖습니다.
 * - https://docs.popbill.com/fax/node/api#GetAccessURL
 */
router.get("/getAccessURL", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  // 팝빌회원 아이디
  const testUserID = "testkorea";

  faxService.getAccessURL(testCorpNum, testUserID,
      function(url) {
        res.render("result", {path: req.path, result: url});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 담당자를 신규로 등록합니다.
 * - https://docs.popbill.com/fax/node/api#RegistContact
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

  faxService.registContact(testCorpNum, contactInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 담당자 목록을 확인합니다.
 * - https://docs.popbill.com/fax/node/api#ListContact
 */
router.get("/listContact", function(req, res, next) {
  // 조회할 아이디
  const testCorpNum = "1234567890";

  faxService.listContact(testCorpNum,
      function(result) {
        res.render("Base/listContact", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 담당자 정보를 수정합니다.
 * - https://docs.popbill.com/fax/node/api#UpdateContact
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

  faxService.updateContact(testCorpNum, testUserID, contactInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 회사정보를 확인합니다.
 * - https://docs.popbill.com/fax/node/api#GetCorpInfo
 */
router.get("/getCorpInfo", function(req, res, next) {
  // 팝빌회원 사업자번호, '-' 제외 10자리
  const testCorpNum = "1234567890";

  faxService.getCorpInfo(testCorpNum,
      function(result) {
        res.render("Base/getCorpInfo", {path: req.path, result: result});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

/*
 * 연동회원의 회사정보를 수정합니다
 * - https://docs.popbill.com/fax/node/api#UpdateCorpInfo
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

  faxService.updateCorpInfo(testCorpNum, corpInfo,
      function(result) {
        res.render("response", {path: req.path, code: result.code, message: result.message});
      }, function(Error) {
        res.render("response", {path: req.path, code: Error.code, message: Error.message});
      });
});

module.exports = router;
