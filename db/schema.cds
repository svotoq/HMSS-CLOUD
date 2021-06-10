namespace bstu.hmss;

using {
    cuid,
    Country,
    managed,
    sap.common.CodeList as CodeList
} from '@sap/cds/common';

entity Rooms {
    key RoomNumber  : String(10);
        Capacity    : Integer default 0;
        Tables      : Integer default 0;
        Beds        : Integer default 0;
        ActionIndicator : ActionType default '';
        Students    : Composition of many Students
                          on Students.Room = $self;
        EmptyPlaces : Integer default 0;
        Notes       : array of Notes;
}

entity Students : cuid {
    FirstName       : String(40) not null;
    LastName        : String(40) not null;
    Patronymic      : String(40);
    Email           : String(241) not null;
    Country         : Country not null;
    CountryText     : String(40);
    City            : String(40) not null;
    AddressLine     : String(60) not null;
    ZipCode         : String(10) not null;
    Room            : Association to Rooms;
    Phones          : array of {
        PhoneNumber : String(30) not null;
        PhoneType   : PhoneType default 'MOBILE';
        PhoneNote   : String(80);
    } not null;
    Notes           : array of Notes;
    CheckIn         : Date;
    CheckOut        : Date;
    ActionIndicator : ActionType default '';
// Faculty: Faculty;
// Course: Integer not null;
// Group: Integer not null;
}

entity Faculties : CodeList {
    key Code : String(3)@(title : 'i18n>FacultyCode')
}

//---------------------------------------------------------------------------
// Types...

type Notes {
    Text  : String;
    CreatedAt: Date;
    CreatedBy: String;
}

type PhoneType : String enum {
    Mobile = 'MOBILE';
    Home   = 'HOME';
    Parent = 'PARENT';
}

type ActionType : String enum {
    Create = 'CREATE';
    Update = 'UPDATE';
    Delete = 'DELETE';
    Empty  = '';
}


//---------------------------------------------------------------------------
// Annotations for Fiori UIs...

annotate Faculties with {
    Code @Common.Text : name;
}


//---------------------------------------------------------------------------
// Annotations...

annotate Faculties with @(
    title       : '{i18n>Faculty}',
    description : '{i18n>Faculty.Description}'
);
