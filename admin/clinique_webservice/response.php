<?php

class CliniqueServiceResponce {

    public function response($isErr,$flag,$values=null) {
        
        $error = new stdClass;
        
        $error->error = $isErr;
        
        $error->msg = $flag;
        
        if($values!==null)
        $error->response = $values;
        
        echo json_encode($error);
    }

}