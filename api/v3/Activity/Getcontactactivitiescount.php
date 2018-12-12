<?php

/**
 * Returns the activity count for the given contact.
 *
 * @param array $params
 */
function civicrm_api3_activity_getcontactactivitiescount($params) {
  $contactActivitySelector = new CRM_Civicase_Activity_ContactActivitiesSelector();

  return $contactActivitySelector->getActivitiesForContactCount($params);
}
