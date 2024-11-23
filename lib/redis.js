import { createClient } from 'redis';

export const redis = createClient({

    socket:{
        host: 'redis-17809.c14.us-east-1-3.ec2.redns.redis-cloud.com',  
        port: 17809
    },
    password: 'd1Km2hZCNQj4H7yzODqJ0I1CyzmPq9lN',  
   

});