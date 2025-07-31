package com.pgis.hrms.modules.announcement.service;

import com.pgis.hrms.modules.policy.model.Policy;
import com.pgis.hrms.modules.announcement.dto.*;
import java.util.*;

public interface AnnouncementService {

    /* HR workflow */
    Integer create(String hrEmail, AnnouncementDetailDto draft);
    void   updateDraft(Integer id, String hrEmail, AnnouncementDetailDto draft);
    void   publish(Integer id, String hrEmail);

    /* Open queries */
    List<AnnouncementDto> listPublished();
    AnnouncementDetailDto detail(Integer id);

    /* Event hook from PolicyService */
    void publishPolicyAnnouncement(Policy p);
}
