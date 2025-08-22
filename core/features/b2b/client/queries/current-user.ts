import { graphql } from '../graphql';

export const CURRENT_USER_QUERY = graphql(`
  query CurrentUser {
    currentUser {
      id
      bcId
      firstName
      lastName
      email
      phone
      role
      masqueradingCompanyId
      extraFields {
        fieldName
        fieldValue
      }
      companyRoleId
      companyRoleName
      companyInfo {
        companyId
        companyName
        companyAddress
        companyCountry
        companyState
        companyCity
        companyZipCode
        phoneNumber
        bcId
      }
    }
  }
`);
