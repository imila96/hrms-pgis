package com.pgis.hrms.modules.leave.config;

import com.pgis.hrms.modules.leave.model.LeaveType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Getter @Setter
@Component
@ConfigurationProperties(prefix = "hrms.leave")
public class LeaveConfig {
    // sensible defaults; properties will override these
    private Map<LeaveType, Integer> entitlements = new EnumMap<>(LeaveType.class) {{
        put(LeaveType.SICK,   14);
        put(LeaveType.CASUAL, 7);
        put(LeaveType.ANNUAL, 14);
    }};
}