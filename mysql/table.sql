create database if not exists zizhifiles DEFAULT CHARSET utf8 COLLATE utf8_general_ci;
use zizhifiles;
create table zizhifiles.companyinfo(
    companyid INTEGER primary key AUTO_INCREMENT,
    companycode varchar(50) not null,
    companyname VARCHAR(300) not null,
    companylocation VARCHAR(100),
    companycategory varchar(100),
    tianyanchaurl varchar(200),
    tianyancharawdata varchar(4000),
    tianyanchacontactdata varchar(2000),
    createddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP,
    updateddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
create table zizhifiles.zizhiinfo(
    zizhiid INTEGER primary key AUTO_INCREMENT,
    zizhiname varchar(180),
    zizhilevel varchar(60),
    zizhiscope VARCHAR(300),
    createddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP,
    updateddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
create table zizhifiles.companyzizhi (
    companyid INTEGER,
    zizhiid INTEGER,
    zizhiapprovedate DATETIME,
    zizhivaliduntildate DATETIME,
    createddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP,
    updateddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_cpzz PRIMARY KEY (companyid, zizhiid),
    CONSTRAINT fk_company FOREIGN KEY (companyid) REFERENCES `companyinfo`(companyid) ON DELETE CASCADE,
    CONSTRAINT fk_zizhi FOREIGN KEY (zizhiid) REFERENCES `zizhiinfo`(zizhiid) ON DELETE CASCADE
);
create table zizhifiles.contactinfo (
    contactid Integer PRIMARY KEY AUTO_INCREMENT,
    contacttype varchar(100), /*电话，邮箱，城市，地区，注册地址*/
    contactinfo varchar(2000),
    createddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP,
    updateddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
create table zizhifiles.companycontact (
    companyid INTEGER,
    contactid INTEGER,
    createddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP,
    updateddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_cpct PRIMARY KEY (companyid, contactid),
    CONSTRAINT fk_company_in_contact FOREIGN KEY (companyid) REFERENCES `companyinfo`(companyid) ON DELETE CASCADE,
    CONSTRAINT fk_contact FOREIGN KEY (contactid) REFERENCES `contactinfo`(contactid) ON DELETE CASCADE
);
alter table zizhifiles.companyinfo add processed varchar(5) DEFAULT 0; -- 0 is not processed 1 is processed 2 is company not exists

drop table zizhifiles.companycontact;
drop table companyzizhi;
drop table companyinfo;
drop table zizhiinfo;
drop table zizhifiles.contactinfo;


select * from zizhifiles.contactinfo;
SELECT * FROM zizhifiles.companyinfo;
SELECT count(*) FROM zizhifiles.zizhiinfo;
SELECT count(*) FROM zizhifiles.companyzizhi;

update zizhifiles.companyinfo set processed = '1' where tianyanchaurl is not null;;

SELECT * FROM zizhifiles.zizhiinfo LIMIT 1000;

SELECT * FROM zizhifiles.companyinfo where processed=0;


SELECT count(*) FROM zizhifiles.companyinfo where tianyanchaurl is null;


select * from companyinfo where tianyancharawdata is null;

commit;