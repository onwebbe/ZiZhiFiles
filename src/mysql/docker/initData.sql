create database if not exists zizhifilestest DEFAULT CHARSET utf8 COLLATE utf8_general_ci;
use zizhifilestest;
create table zizhifilestest.configurations(
    configid INTEGER primary key AUTO_INCREMENT,
    configcategory varchar(100),
    configname varchar(100),
    configvalue varchar(300),
    createddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP,
    updateddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
create table zizhifilestest.companyinfo(
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
create table zizhifilestest.zizhiinfo(
    zizhiid INTEGER primary key AUTO_INCREMENT,
    zizhiname varchar(180),
    zizhilevel varchar(60),
    zizhiscope VARCHAR(300),
    createddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP,
    updateddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
create table zizhifilestest.companyzizhi (
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
create table zizhifilestest.contactinfo (
    contactid Integer PRIMARY KEY AUTO_INCREMENT,
    contacttype varchar(100), /*电话，电子邮箱，注册区域，注册城市*/
    contactinfo varchar(2000),
    createddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP,
    updateddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
create table zizhifilestest.companycontact (
    companyid INTEGER,
    contactid INTEGER,
    createddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP,
    updateddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_cpct PRIMARY KEY (companyid, contactid),
    CONSTRAINT fk_company_in_contact FOREIGN KEY (companyid) REFERENCES `companyinfo`(companyid) ON DELETE CASCADE,
    CONSTRAINT fk_contact FOREIGN KEY (contactid) REFERENCES `contactinfo`(contactid) ON DELETE CASCADE
);
alter table zizhifilestest.companyinfo add processed varchar(5) DEFAULT 0; -- 0 is not processed 1 is processed 2 is company not exists
alter table zizhifilestest.contactinfo add contacttypeid varchar(60);

insert into zizhifilestest.configurations (configcategory, configname, configvalue) 
 values('utemail', 'username', 'uid');
insert into zizhifilestest.configurations (configcategory, configname, configvalue) 
 values('utemail', 'password', 'pwd');
insert into zizhifilestest.configurations (configcategory, configname, configvalue) 
 values('utemail', 'server', 'smtp.163.com');
insert into zizhifilestest.configurations (configcategory, configname, configvalue) 
 values('utemail', 'port', '25');
